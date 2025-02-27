const birthdays = [
    { name: "Person 1", date: "2025-03-15" },
    { name: "Person 2", date: "2025-04-10" },
    // Add up to 16 names with dates
];

function updateCountdown() {
    const now = new Date();
    let nextBirthday = null;

    for (let b of birthdays) {
        const bDate = new Date(b.date);
        if (bDate > now) {
            nextBirthday = bDate;
            break;
        }
    }

    if (nextBirthday) {
        const diff = nextBirthday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        document.getElementById("countdown").innerText =
            `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
}

setInterval(updateCountdown, 1000);

const cakeCountRef = firebase.database().ref('cakeCount');
cakeCountRef.on('value', (snapshot) => {
    document.getElementById('cakeCount').innerText = snapshot.val() || 0;
});

document.getElementById('addCake').addEventListener('click', () => {
    cakeCountRef.transaction(count => (count || 0) + 1);
});

document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

const photoGrid = document.getElementById('photoGrid');
const storageRef = firebase.storage().ref('photos/');

function loadPhotos() {
    storageRef.listAll().then(result => {
        photoGrid.innerHTML = '';
        result.items.forEach(photoRef => {
            photoRef.getDownloadURL().then(url => {
                const img = document.createElement('img');
                img.src = url;
                img.onclick = () => deletePhoto(photoRef);
                photoGrid.appendChild(img);
            });
        });
    });
}

document.getElementById('photoUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const fileRef = storageRef.child(file.name);
        fileRef.put(file).then(loadPhotos);
    }
});

function deletePhoto(photoRef) {
    if (confirm("Delete this photo?")) {
        photoRef.delete().then(loadPhotos);
    }
}

loadPhotos();

const pollRef = firebase.database().ref('poll');
pollRef.once('value').then(snapshot => {
    const pollOptions = ["Cake", "Pizza", "Games"];
    const pollDiv = document.getElementById('pollOptions');
    pollOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.innerText = `${option} (${snapshot.child(option).val() || 0})`;
        btn.onclick = () => {
            pollRef.child(option).transaction(count => (count || 0) + 1);
            btn.innerText = `${option} (${(snapshot.child(option).val() || 0) + 1})`;
        };
        pollDiv.appendChild(btn);
    });
});
