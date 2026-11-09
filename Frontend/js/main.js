document.addEventListener("DOMContentLoaded", () => {
    const authNavItem = document.getElementById('auth-nav-item');
    const startCodingBtn = document.getElementById('start-coding-btn');
    
    // Check if user is logged in
    const userString = localStorage.getItem('anantix_user');
    let user = null;

    if (userString) {
        user = JSON.parse(userString);
    }

    if (user) {
        // User is logged in
        // 1. Change Start Coding Button link directly to IDE
        if(startCodingBtn) startCodingBtn.href = 'ide.html';

        // 2. Set default profile image if not uploaded
        let profilePic = user.profilePic || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; // Default avatar
        let displayName = user.username || user.email.split('@')[0];

        // 3. Replace Login Button with Profile Menu
        authNavItem.innerHTML = `
            <div class="profile-menu">
                <div class="profile-trigger">
                    <img src="${profilePic}" alt="Profile" class="profile-img" id="nav-profile-pic">
                    <span class="profile-name">${displayName}</span>
                </div>
                <div class="profile-dropdown">
                    <p style="font-size: 0.8rem; color: #888; margin-bottom: 10px;">Manage Account</p>
                    <!-- Hidden File Input for Image Upload -->
                    <input type="file" id="profile-upload" accept="image/*" style="display: none;">
                    <button class="profile-action-btn" onclick="document.getElementById('profile-upload').click()">
                        <i class="fas fa-camera"></i> Upload Picture
                    </button>
                    <button class="profile-action-btn logout-btn" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        `;

        // Handle Image Upload (Base64 logic for demo)
        const uploadInput = document.getElementById('profile-upload');
        const navProfilePic = document.getElementById('nav-profile-pic');

        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Image = event.target.result;
                    navProfilePic.src = base64Image;
                    user.profilePic = base64Image;
                    localStorage.setItem('anantix_user', JSON.stringify(user)); // Update local storage
                };
                reader.readAsDataURL(file);
            }
        });

        // Handle Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            localStorage.removeItem('anantix_user');
            window.location.reload(); // Reload page to show login button again
        });

    } else {
        // User is NOT logged in
        if(startCodingBtn) startCodingBtn.href = 'signup.html'; // Default behavior
    }
});