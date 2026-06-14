from rest_framework import serializers
from .models import AccessibilityIssue

class AccessibilityIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessibilityIssue
        fields = [
            'id', 'reported_by', 'latitude', 'longitude', 'description', 
            'category', 'image_before', 'image_after', 'status', 
            'community_votes', 'ai_severity_score', 'ai_category_tag', 'created_at'
        ]
        read_only_fields = ['id', 'ai_severity_score', 'ai_category_tag', 'created_at']