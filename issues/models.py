import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    ROLE_CHOICES = [
        ('CITIZEN', 'Citizen'),
        ('AUTHORITY', 'Municipality Worker'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CITIZEN')

    def __str__(self):
        return f"{self.user.username} - {self.role}"

# Automatic Profile Linker Hooks
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()



import uuid
from django.db import models
from django.contrib.auth.models import User

class AccessibilityIssue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # 🌍 Precise Coordinates Mapping
    latitude = models.FloatField()
    longitude = models.FloatField()
    
    # 📍 Google Places Ingested Metadata Tracking
    full_address = models.TextField(null=True, blank=True) # Stores exact formatted text
    place_name = models.CharField(max_length=255, null=True, blank=True) # Landmark/Establishment name
    
    description = models.TextField()
    image_before = models.ImageField(upload_to='issues/before/')
    image_after = models.ImageField(upload_to='issues/after/', null=True, blank=True)
    
    CATEGORY_CHOICES = [
        ('ramp', 'Wheelchair Ramp'),
        ('tactile', 'Tactile Paving'),
        ('lift', 'Elevator/Lift'),
        ('other', 'Other Issue'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    
    STATUS_CHOICES = [
        ('REPORTED', 'Reported'),
        ('PROVISIONALLY_RESOLVED', 'Provisionally Resolved (Pending Community Votes)'),
        ('RESOLVED', 'Permanently Resolved'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='REPORTED')
    community_votes = models.IntegerField(default=0)
    ai_severity_score = models.IntegerField(null=True, blank=True)
    ai_category_tag = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    # ⏱️ DYNAMIC AUDIT TIMELINE TRACKING FIELDS
    created_at = models.DateTimeField(auto_now_add=True) # 💡 Acts as Reported Date
    resolved_at = models.DateTimeField(null=True, blank=True) # 💡 Filled when status changes to RESOLVED
    
    # 🚨 REJECTION MATRIX TRACKING LOGS (Internal audit storage)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Issue {self.id} - {self.place_name or 'Unnamed Location'}"




# 3. SECURED RELATIONAL MULTI-USER VOTING TABLE (ANTI-COLLUSION LOCK)
class CommunityVote(models.Model):
    VOTE_TYPES = [
        ('CONFIRM', 'Confirm Fix'),
        ('DISPUTE', 'Dispute Resolution'),
    ]
    issue = models.ForeignKey(AccessibilityIssue, on_delete=models.CASCADE, related_name='issue_votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE)
    vote_type = models.CharField(max_length=10, choices=VOTE_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # 💡 THE ULTIMATE LOCK: One real database user can vote exactly ONCE per unique UUID issue.
        unique_together = ('issue', 'voter')    

    def __str__(self):
        return f"Issue {self.id} ({self.status})"