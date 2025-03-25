from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User  
        fields = ["username", "password1", "password2"]

    def clean_username(self):
        username = self.cleaned_data.get("username")
        if username:  # Ensure username is not None
            username = username.lower()
            if User.objects.filter(username=username).exists():
                raise forms.ValidationError("This username is already taken.")
            if " " in username:
                raise forms.ValidationError("Username cannot contain spaces.")
        return username

    def clean_password1(self):
        password = self.cleaned_data.get("password1")
        if len(password) < 8:
            raise forms.ValidationError("Password must be at least 8 characters long.")
        if password.isdigit():
            raise forms.ValidationError("Password cannot be entirely numeric.")
        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get("password1")
        password2 = cleaned_data.get("password2")

        if password1 and password2 and password1 != password2:
            self.add_error("password2", "Passwords do not match.")

        return cleaned_data
