document.addEventListener('DOMContentLoaded', () => {
    const blogContainer = document.querySelector('.blog');
    const form = document.getElementById('new-post-form');
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || [];
    const formContainer = document.querySelector('.form-container');
    const toggleFormButton = document.getElementById('toggle-form-button');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    let editingPostId = null;

    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.style.width = '300px';
        postElement.style.flexGrow = 1;
        postElement.dataset.id = post.id;
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <img src="${post.image}" alt="${post.title}">
            <p>${post.content}</p>
            <button class="edit-post" data-id="${post.id}">Editar</button>
            <button class="delete-post" data-id="${post.id}">Eliminar</button>
            <button class="download-pdf" data-id="${post.id}">Descargar PDF</button>
        `;
        form.querySelector('input[type="submit"]').value = "Publicar";
        return postElement;
    }

    function showExistingPosts() {
        blogContainer.innerHTML = '';
        savedPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogContainer.appendChild(postElement);
        });
    }

    function editPost(postId) {
        const postIndex = savedPosts.findIndex(post => post.id === Number(postId));
        if (postIndex !== -1) {
            const post = savedPosts[postIndex];
            form.title.value = post.title;
            form.content.value = post.content;
            form.image.dataset.id = postId;
            form.querySelector('input[type="submit"]').value = "Actualizar";
            formContainer.classList.add('show-form');
            editingPostId = postId;
        } else {
            alert('La publicación no pudo ser encontrada.');
        }
    }

    cancelEditButton.addEventListener('click', () => {
        form.reset();
        formContainer.classList.remove('show-form');
    });

    showExistingPosts();

    blogContainer.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit-post')) {
            const postId = target.dataset.id;
            editPost(postId);
        } else if (target.classList.contains('delete-post')) {
            const postId = target.dataset.id;
            const index = savedPosts.findIndex(post => post.id === Number(postId));
            if (index !== -1) {
                savedPosts.splice(index, 1);
                localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
                showExistingPosts();
            }
        } else if (target.classList.contains('download-pdf')) {
            const postId = target.dataset.id;
            const post = savedPosts.find(post => post.id === Number(postId));
            generatePDF(post);
        }
    });

    function generatePDF(post) {
        // Abrir una nueva ventana para imprimir el contenido de la publicación
        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>${post.title}</title>
            </head>
            <body>
                <h2>${post.title}</h2>
                <img src="${post.image}" alt="${post.title}">
                <p>${post.content}</p>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Esperar a que se cargue la imagen antes de imprimir
        printWindow.addEventListener('load', () => {
            printWindow.print();
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const postId = editingPostId !== null ? editingPostId : new Date().getTime();
        const postIndex = savedPosts.findIndex(post => post.id === Number(postId));
        if (postIndex !== -1) {
            savedPosts[postIndex].title = form.title.value;
            savedPosts[postIndex].content = form.content.value;
            if (form.image.files.length > 0) {
                const imageFile = form.image.files[0];
                savedPosts[postIndex].image = URL.createObjectURL(imageFile);
            }
            localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
            showExistingPosts();
            formContainer.classList.remove('show-form');
        } else {
            const title = form.title.value;
            const content = form.content.value;
            const imageInput = form.image;
            const imageFile = imageInput.files.length > 0 ? URL.createObjectURL(imageInput.files[0]) : '';
            const newPost = {
                id: postId,
                title,
                content,
                image: imageFile
            };
            savedPosts.push(newPost);
            localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
            showExistingPosts();
            formContainer.classList.remove('show-form');
        }
        form.reset();
        editingPostId = null;
    });

    toggleFormButton.addEventListener('click', () => {
        formContainer.classList.toggle('show-form');
    });
});
