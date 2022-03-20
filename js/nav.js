"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  getAndShowStoriesOnStart()
  hidePageComponents();
  $addStorySection.hide()
  $favoriteStories.hide()
  $addedStoriesSection.hide()
  $allStoriesList.show()
  
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  hidePageComponents();
  $addedStoriesSection.hide()
  $addStorySection.hide()
  $favoriteStories.hide()
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  // $(".main-nav-links").show();  
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//Add story Submission Section/button on navbar.
function navAddStory(){
  hidePageComponents()
  //$addStorySection is the submit form to add stories
  $addStorySection.show()
  $favoriteStories.hide()
  $addedStoriesSection.hide()
}

$navAddStory.on('click', navAddStory)



//This is added stories section button on navbar
function navListOfAddedStories(){
  $addStorySection.hide()
  $favoriteStories.hide()
  $allStoriesList.hide()
  $addedStoriesSection.show()
  //This function runs and updates the List of added stories and updates the favorited added stories.
  appendNewStoryToSection()
}

$navAddedStories.on('click', navListOfAddedStories)


// This is favorite button on navbar
function navFavDisplay() {
  $allStoriesList.hide();
  $addedStoriesSection.hide()
  $addStorySection.hide()
  $loginForm.hide()
  $signupForm.hide()
  updateFavoriteDisplay()
  $favoriteStories.show()
  
}

$navFavorite.on('click', navFavDisplay)