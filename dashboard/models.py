from django.db import models
from django.contrib.auth.models import User

class Matchmaker(models.Model):
    """
    Represents a Matchmaker/Agent in the system.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='matchmaker_profile', null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=100, default='Matchmaker')

    def __str__(self):
        return f"{self.name} ({self.role})"


class Customer(models.Model):
    """
    Represents a client/customer profile.
    """
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]

    OPTION_CHOICES = [
        ('Yes', 'Yes'),
        ('No', 'No'),
        ('Maybe', 'Maybe'),
    ]

    customer_id = models.CharField(max_length=10, unique=True, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    age = models.IntegerField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    religion = models.CharField(max_length=50, blank=True)
    caste = models.CharField(max_length=50, blank=True)
    height = models.CharField(max_length=20, blank=True)
    education = models.CharField(max_length=100, blank=True)
    company = models.CharField(max_length=100, blank=True)
    designation = models.CharField(max_length=100, blank=True)
    income = models.CharField(max_length=50, blank=True)
    marital_status = models.CharField(max_length=50, default='Never Married')
    languages = models.CharField(max_length=255, blank=True, help_text="Comma-separated languages")
    
    # Preferences
    wants_kids = models.CharField(max_length=10, choices=OPTION_CHOICES, default='Maybe')
    open_to_relocate = models.CharField(max_length=10, choices=OPTION_CHOICES, default='Maybe')
    open_to_pets = models.CharField(max_length=10, choices=OPTION_CHOICES, default='Maybe')
    status_tag = models.CharField(max_length=50, default='New Lead')
    email = models.EmailField(unique=True, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.name} ({self.customer_id or self.pk})"


class Match(models.Model):
    """
    Tracks AI-curated match suggestions between customers.
    """
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Sent', 'Sent'),
        ('Accepted', 'Accepted'),
        ('Rejected', 'Rejected'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='match_suggestions_received')
    candidate = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='match_suggestions_profiled')
    compatibility_score = models.IntegerField(default=50)
    high_compatibility = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    sent_by = models.ForeignKey(
        Matchmaker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='matches_sent',
    )
    sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'candidate')
        verbose_name_plural = "Matches"

    def __str__(self):
        return f"{self.customer.name} x {self.candidate.name} ({self.compatibility_score}%)"


class Meeting(models.Model):
    """
    Represents introduction meetings between a customer and candidate.
    """
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='meetings_as_customer')
    candidate = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='meetings_as_candidate')
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    meeting_type = models.CharField(max_length=100, default='Introduction Meeting')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.name} x {self.candidate.name} - {self.scheduled_time.strftime('%Y-%m-%d %H:%M')}"


class Note(models.Model):
    """
    Tracks matchmaker session notes and observations.
    """
    NOTE_TYPE_CHOICES = [
        ('session', 'Session Note'),
        ('observation', 'Observation'),
        ('followup', 'Follow-up'),
        ('alert', 'Alert'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='notes')
    matchmaker = models.ForeignKey(Matchmaker, on_delete=models.SET_NULL, null=True, blank=True, related_name='notes_created')
    note_type = models.CharField(max_length=20, choices=NOTE_TYPE_CHOICES, default='session')
    text = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        author_name = self.matchmaker.name if self.matchmaker else "System Alert"
        return f"{self.note_type.capitalize()} on {self.customer.name} by {author_name}"