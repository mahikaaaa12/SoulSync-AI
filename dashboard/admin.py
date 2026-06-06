from django.contrib import admin
from .models import Matchmaker, Customer, Match, Meeting, Note

@admin.register(Matchmaker)
class MatchmakerAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role')
    search_fields = ('name', 'email', 'role')

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customer_id', 'first_name', 'last_name', 'gender', 'age', 'city', 'status_tag')
    list_filter = ('gender', 'status_tag', 'religion', 'city')
    search_fields = ('first_name', 'last_name', 'customer_id', 'email', 'city')

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('customer', 'candidate', 'compatibility_score', 'status', 'sent_by', 'sent_at')
    list_filter = ('high_compatibility', 'status', 'sent_at')
    search_fields = ('customer__first_name', 'customer__last_name', 'candidate__first_name', 'candidate__last_name')

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('customer', 'candidate', 'scheduled_time', 'status', 'meeting_type')
    list_filter = ('status', 'meeting_type')
    search_fields = ('customer__first_name', 'customer__last_name', 'candidate__first_name', 'candidate__last_name')

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('customer', 'matchmaker', 'note_type', 'created_at')
    list_filter = ('note_type', 'created_at')
    search_fields = ('customer__first_name', 'customer__last_name', 'text')