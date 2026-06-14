import google.generativeai as genai
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import AccessibilityIssue
from .serializers import AccessibilityIssueSerializer
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

# 💡 Bulletproof helper to parse raw EXIF GPS rational tuples into clean decimal degrees
def get_decimal_from_rational(rational_tuple):
    try:
        d = float(rational_tuple[0])
        m = float(rational_tuple[1])
        s = float(rational_tuple[2])
        return d + (m / 60.0) + (s / 3600.0)
    except (IndexError, TypeError, ZeroDivisionError):
        return None

def extract_image_coordinates(image_field):
    try:
        img = Image.open(image_field)
        exif_data = img._getexif()
        if not exif_data:
            return None
        
        gps_info = {}
        for tag, value in exif_data.items():
            decoded = TAGS.get(tag, tag)
            if decoded == "GPSInfo":
                for sub_tag in value:
                    sub_decoded = GPSTAGS.get(sub_tag, sub_tag)
                    gps_info[sub_decoded] = value[sub_tag]
                
                lat_val = gps_info.get('GPSLatitude')
                lat_ref = gps_info.get('GPSLatitudeRef')
                lon_val = gps_info.get('GPSLongitude')
                lon_ref = gps_info.get('GPSLongitudeRef')

                if lat_val and lon_val:
                    lat = get_decimal_from_rational(lat_val)
                    lon = get_decimal_from_rational(lon_val)
                    
                    if lat and lon:
                        if lat_ref != 'N': lat = -lat
                        if lon_ref != 'E': lon = -lon
                        return lat, lon
        return None
    except Exception:
        return None

class AccessibilityIssueViewSet(viewsets.ModelViewSet):
    queryset = AccessibilityIssue.objects.all().order_by("-created_at")
    serializer_class = AccessibilityIssueSerializer

    # Initial AI grading loop remains untouched for public submission tracking
    def perform_create(self, serializer):
        instance = serializer.save()
        if settings.GEMINI_API_KEY and instance.image_before:
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')
                with instance.image_before.open('rb') as f:
                    img_data = f.read()
                prompt = f'Analyze this barrier report: "{instance.description}". Provide evaluation format:\nSEVERITY_SCORE: [1-5]\nCATEGORY_TAG: [2-3 words description]'
                response = model.generate_content([prompt, {"mime_type": "image/jpeg", "data": img_data}])
                for line in response.text.strip().split('\n'):
                    if "SEVERITY_SCORE:" in line:
                        instance.ai_severity_score = int(line.split("SEVERITY_SCORE:")[1].strip())
                    if "CATEGORY_TAG:" in line:
                        instance.ai_category_tag = line.split("CATEGORY_TAG:")[1].strip()
                instance.save()
            except Exception as e:
                print(f"AI initial analysis exception: {str(e)}")

    # 💡 Streamlined Update Hook: Isolated strictly for Coordinate Proximity Validation
    def perform_update(self, serializer):
        incoming_status = self.request.data.get('status')
        
        if incoming_status == 'RESOLVED':
            instance = self.get_object()
            uploaded_proof = self.request.FILES.get('image_after')

            if not uploaded_proof:
                raise ValidationError({"image_after": "Validation Error: Resolution proof image asset is required."})

            print("\n=== SYSTEM HARDWARE LOG: EXTRACTING EXIF METADATA ===")
            img_coordinates = extract_image_coordinates(uploaded_proof)
            
            if img_coordinates:
                img_lat, img_lon = img_coordinates
                
                # Calculating absolute delta variances
                lat_delta = abs(img_lat - instance.latitude)
                lon_delta = abs(img_lon - instance.longitude)
                
                print(f"Complaint Target Node: {instance.latitude}, {instance.longitude}")
                print(f"Proof Image Metadata: {img_lat}, {img_lon}")
                print(f"Variance Delta - LAT: {lat_delta}, LON: {lon_delta}")

                # 💡 Max tolerance threshold value set to 0.005 (approx 500 meters boundary radius)
                if lat_delta > 0.005 or lon_delta > 0.005:
                    raise ValidationError({
                        "image_after": "Geographic Alignment Failure: The uploaded evidence photo coordinates do not match the vicinity of the initial reported barrier location."
                    })
                print("Hardware Verification Token: Matching range confirmed.")
            else:
                # Strict security fallback rule: If image lacks coordinates, reject it to prevent fake web uploads
                raise ValidationError({
                    "image_after": "Metadata Error: The uploaded image file does not contain valid embedded GPS geotags. Please ensure location/GPS services are enabled on your camera device while capturing resolution proof."
                })

            serializer.save(status='PROVISIONALLY_RESOLVED')
            print("Audit Complete: Ticket moved to provisionally resolved queue.\n")
            return

        serializer.save()

    @action(detail=True, methods=['post'], url_path='vote')
    def process_community_vote(self, request, pk=None):
        instance = self.get_object()
        action_type = request.data.get('vote_action')

        if instance.status != 'PROVISIONALLY_RESOLVED':
            return Response({"error": "Action locked: Ticket is not in community verification loop parameters."}, status=status.HTTP_400_BAD_REQUEST)

        if action_type == 'confirm':
            instance.community_votes += 1
            if instance.community_votes >= 3:
                instance.status = 'RESOLVED'
            instance.save()
            return Response({"success": f"Vote counted. Current validation verification at: {instance.community_votes}/3"})
            
        elif action_type == 'dispute':
            instance.status = 'REPORTED'
            instance.community_votes = 0
            instance.save()
            return Response({"warning": "Dispute payload validated. Rolling system state logs back to active pool parameters."})

        return Response({"error": "Invalid action parameters allocated."}, status=status.HTTP_400_BAD_REQUEST)