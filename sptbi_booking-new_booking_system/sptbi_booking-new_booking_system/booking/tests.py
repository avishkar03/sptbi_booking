from django.core.mail import send_mail
from django.http import HttpResponse
from django.test import override_settings
from django.conf import settings  # Add this import
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_email(request):
    try:
        # Print email settings for debugging
        print("\n===== EMAIL SETTINGS =====")
        print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
        print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
        print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        print(f"ADMIN_EMAIL: {settings.ADMIN_EMAIL}")
        print(f"BOOKING_ADMIN_EMAIL: {getattr(settings, 'BOOKING_ADMIN_EMAIL', 'Not set')}")

        # Try direct SMTP first
        try:
            print("\n===== TRYING DIRECT SMTP =====")
            # Create message container
            msg = MIMEMultipart()
            msg['From'] = settings.DEFAULT_FROM_EMAIL
            msg['To'] = settings.BOOKING_ADMIN_EMAIL
            msg['Subject'] = 'Test Email via Direct SMTP'

            # Add message body
            message_body = "This is a test email sent via direct SMTP."
            msg.attach(MIMEText(message_body, 'plain'))

            # Connect to SMTP server
            print("Connecting to SMTP server...")
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.set_debuglevel(1)  # Add debugging
            server.ehlo()

            if settings.EMAIL_USE_TLS:
                print("Starting TLS...")
                server.starttls()
                server.ehlo()

            print("Logging in...")
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

            print("Sending email...")
            server.send_message(msg)
            server.quit()

            print("Email sent successfully using direct SMTP!")
            smtp_result = "Direct SMTP: Success"
        except Exception as smtp_error:
            print(f"Direct SMTP failed: {str(smtp_error)}")
            smtp_result = f"Direct SMTP: Failed - {str(smtp_error)}"

        # Try Django's send_mail
        try:
            print("\n===== TRYING DJANGO SEND_MAIL =====")
            send_mail(
                subject='Test Email via Django',
                message='This is a test email from Django.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.BOOKING_ADMIN_EMAIL],
                fail_silently=False,
            )
            print("Email sent successfully using Django's send_mail!")
            django_result = "Django send_mail: Success"
        except Exception as django_error:
            print(f"Django send_mail failed: {str(django_error)}")
            django_result = f"Django send_mail: Failed - {str(django_error)}"

        return HttpResponse(f"""
            <h1>Email Test Results</h1>
            <p><strong>{smtp_result}</strong></p>
            <p><strong>{django_result}</strong></p>
            <p>Check server console for detailed logs.</p>
        """)
    except Exception as e:
        error_message = f"Failed to run email tests: {str(e)}"
        print(error_message)
        import traceback
        traceback.print_exc()
        return HttpResponse(f"<h1>Error</h1><p>{error_message}</p>")