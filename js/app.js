//* Proyecto App de recetas con FETCH API y LocalStorage
//* Este proyecto utiliza Bootstrap como framework CSS

function initApp() {
  const selectCategories = document.querySelector("#categorias");
  const result = document.querySelector("#resultado");

  if (selectCategories) {
    selectCategories.addEventListener("change", selectCategory);
    getCategories();
  } 

  const favoritesDiv = document.querySelector('.favoritos')
  if( favoritesDiv) {
    getFavorites();
  }

  const modal = new bootstrap.Modal("#modal", {});


  function getCategories() {
    const url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    fetch(url)
      .then((response) => response.json())
      .then((result) => showCategories(result.categories));
  }

  function showCategories(categories = []) {
    categories.forEach((category) => {
      const option = document.createElement("OPTION");

      const { strCategory } = category;
      option.value = strCategory;
      option.textContent = strCategory;

      selectCategories.appendChild(option);
    });
  }

  function selectCategory(event) {
    const category = event.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    fetch(url)
      .then((response) => response.json())
      .then((result) => showRecipes(result.meals));
  }

  function showRecipes(recipes = []) {
    //*Limpiar el html previo
    cleanHTML(result);

    //*Dar mensaje al usuario si hay o no resultados
    const heading = document.createElement("H2");
    heading.classList.add("text-center", "text-black", "my-5");
    heading.textContent = recipes.length ? "Resultados" : "No hay resultados";
    result.appendChild(heading);

    //*Iterar sobre los resultados
    recipes.forEach((recipe) => {
      const { idMeal, strMeal, strMealThumb } = recipe;

      const recipeContainer = document.createElement("DIV");
      recipeContainer.classList.add("col-md-4");

      const recipeCard = document.createElement("DIV");
      recipeCard.classList.add("card", "mb-4");

      const recipeImg = document.createElement("IMG");
      recipeImg.classList.add("card-img-top");
      recipeImg.alt = `Imagen de la receta: ${strMeal ?? recipe.title}`;
      recipeImg.src = strMealThumb ?? recipe.img;

      const recipeCardBody = document.createElement("DIV");
      recipeCardBody.classList.add("card-body");

      const recipeHeading = document.createElement("H3");
      recipeHeading.classList.add("card-title", "mb-3");
      recipeHeading.textContent = strMeal;

      const recipeBtn = document.createElement("BUTTON");
      recipeBtn.classList.add("btn", "btn-danger", "w-100");
      recipeBtn.textContent = "Ver Receta";
      //   recipeBtn.dataset.bsTarget = '#modal';
      //   recipeBtn.dataset.bsToggle = 'modal';

      recipeBtn.onclick = () => {
        selectRecipe(idMeal ?? recipe.id);
      };

      //*Inyectar en el codigo HTML
      recipeCardBody.appendChild(recipeHeading);
      recipeCardBody.appendChild(recipeBtn);

      recipeCard.appendChild(recipeImg);
      recipeCard.appendChild(recipeCardBody);

      recipeContainer.appendChild(recipeCard);

      result.appendChild(recipeContainer);
    });
  }

  function selectRecipe(id) {
    const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    fetch(url)
      .then((response) => response.json())
      .then((result) => showRecipeModal(result.meals[0]));
  }

  function showRecipeModal(recipe) {
    const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;

    //Agregar contenido al modal
    const modalTitle = document.querySelector("#modal .modal-title");
    const modalBody = document.querySelector("#modal .modal-body");

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidades</h3>

    `;

    const listGroup = document.createElement("UL");
    listGroup.classList.add("list-group");

    //* Mostrar cantidades e ingredientes
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        const ingredient = recipe[`strIngredient${i}`];
        const quantity = recipe[`strMeasure${i}`];

        const ingredientLi = document.createElement("LI");
        ingredientLi.classList.add("list-group-item");
        ingredientLi.textContent = `${ingredient} - ${quantity}`;

        listGroup.appendChild(ingredientLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector(".modal-footer");
    cleanHTML(modalFooter);

    //* Botones de cerrar y Favorito
    const favoriteBtn = document.createElement("BUTTON");
    favoriteBtn.classList.add("btn", "btn-danger", "col");
    favoriteBtn.textContent = storageExists(idMeal)
      ? "Eliminar de Favoritos"
      : "Agregar a Favoritos";

    const closeModalBtn = document.createElement("BUTTON");
    closeModalBtn.classList.add("btn", "btn-secondary", "col");
    closeModalBtn.textContent = "Cerrar";
    closeModalBtn.onclick = () => modal.hide();

    modalFooter.appendChild(favoriteBtn);
    modalFooter.appendChild(closeModalBtn);

    //* Guardar favoritos en locaStorage
    favoriteBtn.onclick = () => {
      if (storageExists(idMeal)) {
        deleteFavorite(idMeal);
        favoriteBtn.textContent = "Guardar en Favoritos";

        showToast("Eliminado Correctamente");

        return;
      }

      addFavorite({
        id: idMeal,
        title: strMeal,
        img: strMealThumb,
      });
      favoriteBtn.textContent = "Eliminar de Favoritos";
      showToast("Agregado a Correctamente");
    };

    //*Muesta el modal
    modal.show();
  }

  function addFavorite(recipe) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    localStorage.setItem("favorites", JSON.stringify([...favorites, recipe]));
  }

  function deleteFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];
    const newFavorites = favorites.filter((favorite) => favorite.id !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  }

  function storageExists(id) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) ?? [];

    return favorites.some((favorite) => favorite.id === id);
  }

  function showToast(message) {
    const toastDiv = document.querySelector("#toast");
    const toastBody = document.querySelector(".toast-body");
    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = message;

    toast.show();
  }

  function getFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
    if(favorites.length) {
        showRecipes(favorites);

        return;
    } 

    const noFavorites = document.createElement('P');
    noFavorites.textContent = 'No hay favoritos aun'
    noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5')

    result.appendChild(noFavorites);
  }

  function cleanHTML(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  }
}

document.addEventListener("DOMContentLoaded", initApp);
