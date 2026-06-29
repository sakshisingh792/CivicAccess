from django.contrib import admin
from .models import AccessibilityIssue
from django.utils import timezone

@admin.register(AccessibilityIssue)
class AccessibilityIssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'place_name', 'status', 'created_at', 'resolved_at', 'rejected_at')
    list_filter = ('status', 'category')
    search_fields = ('description', 'place_name')
    
    fieldsets = (
        ('Core Info', {
            'fields': ('reported_by', 'category', 'description', 'image_before', 'image_after')
        }),
        ('Geographic Location', {
            'fields': ('latitude', 'longitude', 'place_name', 'full_address')
        }),
        ('Status & Lifecyle Timeline', {
            'fields': ('status', 'community_votes', 'created_at', 'resolved_at'),
        }),
        ('Internal Rejection Logs (If Audit Fails)', {
            'fields': ('rejected_at', 'rejection_reason'),
            'classes': ('collapse',), # Collapsed by default to keep it neat
        }),
    )
    
    # Marks created_at as readable inside admin panel since it is auto_now_add
    readonly_fields = ('created_at',)

    # 💡 AUTOMATION TRICK: Automatically populate date locks when an admin changes status via panel
    def save_model(self, request, obj, form, change):
        if change:
            original_obj = AccessibilityIssue.objects.get(pk=obj.pk)
            if original_obj.status != 'RESOLVED' and obj.status == 'RESOLVED':
                obj.resolved_at = timezone.now()
            elif original_obj.status != 'REJECTED' and obj.status == 'REJECTED':
                obj.rejected_at = timezone.now()
        super().save_model(request, obj, form, change)