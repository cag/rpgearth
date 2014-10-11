from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout

def index(request):
    if request.user.is_authenticated():
        # Do something for authenticated users.
        return render(request, 'index.html', {})
    else:
        # Do something for anonymous users.
        if request.method == 'POST':
            if not request.POST.get('remember_me', None):
                request.session.set_expiry(0)

            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    return render(request, 'index.html', {})
                else:
                    # Return a 'disabled account' error message
                    return render(request, 'login.html', { 'request_path': request.path })
            else:
                # Return an 'invalid login' error message.
                return render(request, 'login.html', { 'request_path': request.path })
        else:
            return render(request, 'login.html', { 'request_path': request.path })

def logout_view(request):
    logout(request)
    return redirect('/')