from .models import Player
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def index(request):
    def successful_render():
        return render(request, 'index.html', { 'user': request.user, 'player': request.user.player })

    if request.user.is_authenticated():
        # Do something for authenticated users.
        if not hasattr(request.user, 'player'):
            p = Player(user=request.user)
            p.save()
        return successful_render()
    else:
        # Do something for anonymous users.
        if request.method == 'POST':
            # if not request.POST.get('remember_me', None):
            #     request.session.set_expiry(0)

            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return successful_render()
                else:
                    # Return a 'disabled account' error message
                    return render(request, 'login.html', {})
            else:
                # Return an 'invalid login' error message.
                return render(request, 'login.html', {})
        else:
            return render(request, 'login.html', {})

def logout_view(request):
    logout(request)
    return redirect('/')
