from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils.text import slugify
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail


def generate_unique_id():
    return str(uuid.uuid4())


class Floor(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    rooms = models.JSONField(default=list, blank=True, null=True)
    number_of_rooms = models.IntegerField(default=5)





    BOOKING_TYPE_CHOICES = [
        ('Instant Booking', 'Instant Booking'),
        # ('restricted', 'Restricted'),
        ('Requires Approval', 'Requires Approval'),

    ]

    booking_type = models.CharField(
        max_length=50,
        choices=BOOKING_TYPE_CHOICES,
        default='Instant Booking',
    )



    class Meta:
        ordering = ['order']
        verbose_name = 'Floor'
        verbose_name_plural = 'Floors'


    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class aTimeSlot(models.Model):
    id = models.CharField(
        primary_key=True, default=generate_unique_id, max_length=100)
    slot = models.CharField(max_length=10)
    # room = models.IntegerField(null=True, blank=True)
    room = models.CharField(max_length=100, null=True, blank=True)
    date = models.CharField(null=True, blank=True, max_length=10)
    name = models.CharField(null=True, blank=True, max_length=100)
    email = models.EmailField(null=True, blank=True)             # For pending status email functionality
    month = models.CharField(null=True, blank=True, max_length=2)
    year = models.CharField(null=True, blank=True, max_length=4)
    reason = models.CharField(null=True, blank=True, max_length=100)

    def __str__(self):
        return str(self.slot)


class Booking(models.Model):
    FLOOR_CHOICES = [
        ('1st', '1st Floor'),
        ('2nd', '2nd Floor'),
        ('8th', '8th Floor'),
    ]

    # email = models.EmailField(null=True, blank=True)  # For pending status email functionality
    time_slot = models.TimeField()
    booked_by = models.CharField(max_length=255)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE)
    date = models.DateField()
    room = models.CharField(max_length=100)
    reason = models.CharField(max_length=255, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)


    STATUS_CHOICES = (  # For email functionality
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('confirmed', 'Confirmed'),  # For instant booking functionality
    )

    status = models.CharField(      # For Email fucntionality
        max_length = 20,
        choices = STATUS_CHOICES,
        default = 'pending',
    )

    approval_token = models.CharField(  # For Email fucntionality
        max_length = 100,
        unique = True,
        null = True,
        blank = True,
    )
    admin_notes = models.TextField(blank=True, null=True) #Optional for Reject Reasons

    def save(self, *args, **kwargs):      #For Email fucntionality
        # Always generate an approval token if it doesn't exist
        if not self.approval_token:
            self.approval_token = str(uuid.uuid4())
        super().save(*args, **kwargs)


    class Meta:
        ordering = ['date', 'time_slot']

    def __str__(self):
        return f"{self.floor.name} - {self.room} - {self.time_slot}"




@receiver(post_save, sender=Booking)
def send_booking_status_notification(sender, instance, **kwargs):
    if instance.status in ['approved', 'rejected']:
        subject = f"Booking {instance.status} for {instance.room}"
        message = f"Your booking for {instance.room} on {instance.date} has been {instance.status}."
        send_mail(subject, message, 'admin@sptbi.com', [instance.user.email])


