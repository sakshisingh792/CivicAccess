import uuid
from django.db import models
from django.contrib.auth.models import User

class AccessibilityIssue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
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
    
    # 💡 Upgraded Status choices for Advanced Community Auditing
    STATUS_CHOICES = [
        ('REPORTED', 'Reported'),
        ('PROVISIONALLY_RESOLVED', 'Provisionally Resolved (Pending Community Votes)'),
        ('RESOLVED', 'Permanently Resolved'),
    ]
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='REPORTED')
    
    # 💡 Tracking parameters for crowdsourced verification layers
    community_votes = models.IntegerField(default=0)
    
    ai_severity_score = models.IntegerField(null=True, blank=True)
    ai_category_tag = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Issue {self.id} ({self.status})"