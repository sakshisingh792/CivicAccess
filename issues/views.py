import google.generativeai as genai
from django.conf import settings
from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User

# 💡 Ingesting updated structural models and cryptographic auth pipelines
from .models import AccessibilityIssue, CommunityVote
from .serializers import AccessibilityIssueSerializer, RegisterSerializer, CustomTokenObtainPairSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS

# =====================================================================
# 🌐 AUTHENTICATION GATEWAY CONTROLLERS
# =====================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Overwrites the default JWT endpoint to pass encrypted role properties 
    and usernames inside the token handshake payload.
    """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """
    Public open API endpoint managing account registrations and structural 
    profile mappings across the ledger.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


# =====================================================================
# 🗺️ HARDWARE UTILITIES & EXIF TELEMETRY PARSERS
# =====================================================================

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


# =====================================================================
# 🛡️ CORE BUSINESS LOGIC WORKFLOW ENGINE
# =====================================================================

class AccessibilityIssueViewSet(viewsets.ModelViewSet):
    queryset = AccessibilityIssue.objects.all().order_by("-created_at")
    serializer_class = AccessibilityIssueSerializer
    
    # 💡 Core security layer parameters protecting tracking state modifications
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Implicitly map authenticated user tokens to the reported_by log relation
        if self.request.user.is_authenticated:
            instance = serializer.save(reported_by=self.request.user)
        else:
            instance = serializer.save()

        # Initial Gemini AI Grading Loop
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

    def perform_update(self, serializer):
        incoming_status = self.request.data.get('status')