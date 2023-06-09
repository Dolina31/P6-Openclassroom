const gallery = document.querySelector(".gallery");
const filters = document.querySelectorAll(".filter");
const modalImg = document.querySelector(".modal_img");
const modal = document.querySelector("dialog");
const modalButton = document.querySelectorAll(".modal-button");
const closeModalIcon = document.querySelector(".close_modal_icon");
const modalContent = document.querySelector(".modal_content");
const editingToolsBanner = document.querySelector(".editing-tools-banner");
const login = document.querySelector(".login")
console.log(login);
let works = [];
let categories = [];

function WorksImport() {
    fetch("http://localhost:5678/api/works")
        .then((res) => res.json())
        .then((data) => {
            works = data;
            generateWorks(works);
            displayModal(works);
        });
}
WorksImport();

function categoriesImport() {
    fetch("http://localhost:5678/api/categories")
        .then((res) => res.json())
        .then((data) => {
            categories = data;
        });
}
categoriesImport();

function generateWorks(worksArray) {
    gallery.innerHTML = "";

    worksArray.forEach((work) => {
        const figure = document.createElement("figure");
        gallery.appendChild(figure);
        figure.classList = work.category.name;
        figure.setAttribute("data-id", work.id);

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;
        figure.appendChild(img);

        const figcaption = document.createElement("figcaption");
        figcaption.innerHTML = work.title;
        figure.appendChild(figcaption);
    });
}

function worksFilter() {
    filters.forEach((filter) => {
        const filterValue = filter.textContent;

        filter.addEventListener("click", () => {
            let filteredWorks = [];
            if (filterValue === "Tous") {
                filteredWorks = works;
            } else {
                filteredWorks = works.filter(
                    (work) => work.category.name === filterValue
                );
            }
            generateWorks(filteredWorks);
        });
    });
}
worksFilter();

// ------- fonctionnement de la modale

// Condition si utilisateur connecté
let token = localStorage.getItem("Token");

if (token) {
    editingToolsBanner.style.display = "flex";

    modalButton.forEach((button) => {
        button.style.display = "flex";
    });

    login.innerHTML = "logout"
    login.addEventListener("click", () => {
        localStorage.removeItem("Token")
        window.location.href = "login.html"
    })
}

// Request pour delete

function displayModal(worksArray) {
    let modalContentHTML = "";
    worksArray.forEach((work) => {
        modalContentHTML += `
            <div class="modal_img-edit_position">
                <img src="${work.imageUrl}">
                <i class="fa-regular fa-trash-can modal_trash-icon" data-id="${work.id}"></i>
                <i class="fa-solid fa-arrows-up-down-left-right modal_arrow-icon"></i>
                <p>éditer</p>
            </div>
        `;
    })
    modalImg.innerHTML = modalContentHTML;

    const modalDeleteWorkIcon = document.querySelectorAll(".modal_trash-icon");

    // Delete work
    let deleteRequest = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    modalDeleteWorkIcon.forEach((trashcan) => {
        trashcan.addEventListener("click", () => {
            const workId = trashcan.getAttribute("data-id");
            fetch(`http://localhost:5678/api/works/${workId}`, deleteRequest)
                .then((res) => {
                    if (res.ok) {
                        trashcan.parentElement.remove();
                        const deletefigure = document.querySelector(`figure[data-id="${workId}"]`);
                        deletefigure.remove();
                    }
                });
        });
    });
}

// fonction qui regroupe les différentes manière d'ouvrir et de fermé la modale
function OpenAndCloseModal() {
    modalButton[2].addEventListener("click", () => {
        modal.showModal();
    });
};
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.close();
    }
});
closeModalIcon.addEventListener("click", () => {
    modal.close();
});
OpenAndCloseModal();

// Fonction qui permet de générer des differentes catègories lors de la création d'un nouveau projet
function generateCategoryOptions() {
    let optionsHTML = "";
    categories.forEach((category) => {
        optionsHTML += `<option value="${category.id}">${category.name}</option>`;
    });
    return optionsHTML;
}

function displayAddWorkModal() {
    let initialModalContentHTML = "";
    const modalAddWorkBtn = document.querySelector(".modal_add-btn");

    modalAddWorkBtn.addEventListener("click", () => {
        initialModalContentHTML = modalContent.innerHTML;

        modalContent.innerHTML = "";
        modalContent.innerHTML =
            `
            <i class="fa-solid fa-arrow-left modal_add-work_return-icon"></i>
            <div class="modal_content_add-work">
                <h3>Ajout photo</h3>
                <form action="">
                    <div class="add-img-form">
                        <i class="fa-sharp fa-regular fa-image"></i>
                        <img src="" class="selected-img">
                        <label for="photo" class="form-add-img-button">+ Ajouter photo</label>
                        <input type="file" id="photo" name="photo">
                        <p>jpg, png : 4mo max</p>
                    </div>
                    <div>
                        <div class="modal_add-work_input">
                            <label for="titre">Titre</label>
                            <input type="text" id="titre" name="titre" autocomplete="off">
                        </div>
                        <div class="modal_add-work_input">
                            <label for="categorie">Catégorie</label>
                            <select name="categorie" id="categorie">
                                <option value=""></option>
                                ${generateCategoryOptions()}
                            </select>
                        </div>
                    </div>
                </form>
                <p class="invalid-form-message">Veuillez remplir tous les champs pour ajouter un projet</p>
                <p class="valid-form-message">Formulaire enregistré !</p>
                <p class="invalid-request-form-message">Une erreur s'est produite lors de la soumission du formulaire</p>
                <span class="modal_line"></span>
                <button class="modal_add-work_confirm-btn">Valider</button>
            </div>
        `;


        const photoInput = document.getElementById("photo");
        const titleInput = document.getElementById("titre");
        const selectInput = document.getElementById("categorie");
        const submitWorkButton = document.querySelector(".modal_add-work_confirm-btn");
        const selectedImage = document.querySelector(".selected-img");
        const invalidFormMessage = document.querySelector(".invalid-form-message");
        const validFormMessage = document.querySelector(".valid-form-message");
        const invalidRequestFormMessage = document.querySelector(".invalid-request-form-message");
        const returnToDefaultModalButton = document.querySelector(".modal_add-work_return-icon");

        // Fonction de retour sur la modale
        returnToDefaultModalButton.addEventListener("click", () => {
            modalContent.innerHTML = initialModalContentHTML;
            displayModal(works);
            displayAddWorkModal();
        });

        //Affichage de l'image lors de sa selection 
        photoInput.addEventListener("change", () => {
            const file = photoInput.files[0];
            const reader = new FileReader();

            reader.onload = (e) => {
                selectedImage.src = e.target.result;
                const addImgForm = document.querySelector(".add-img-form");
                const formElements = addImgForm.querySelectorAll(".add-img-form > *");

                formElements.forEach((element) => {
                    element.style.display = "none";
                });
                selectedImage.style.display = "flex";
            };
            reader.readAsDataURL(file);
        });

        // Add work
        function createNewWork() {
            submitWorkButton.addEventListener("click", () => {
                if (photoInput.value === '' || titleInput.value === '' || selectInput.value === '') {
                    invalidFormMessage.style.display = "block";
                    return;
                }

                let formData = new FormData();

                formData.append("image", photoInput.files[0]);
                formData.append("title", titleInput.value);
                formData.append("category", selectInput.value);

                let addRequest = {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                };

                fetch("http://localhost:5678/api/works", addRequest)
                    .then((res) => {
                        if (res.ok) {
                            invalidFormMessage.style.display = "none";
                            validFormMessage.style.display = "block";
                            submitWorkButton.classList.add("active")

                        } else {
                            invalidFormMessage.style.display = "none";
                            invalidRequestFormMessage.style.display = "block"
                        }
                    });
            });
        }
        createNewWork();
    });
}
displayAddWorkModal();