"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // const hostName = story.getHostName();
  const hostName = null
  return $(`
      
      <li id="${story.storyId}">
      <button class='fav' id="favButton">fav</button>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


function putStoriesOnPage() {
  $allStoriesList.empty();
  for (let story of storyList.stories) {
    const $storyElementDisplayed = generateStoryMarkup(story);
    $allStoriesList.append($storyElementDisplayed);
  }
  //This function updates the favorited elements in the selected section.
  makeYellow(storyList.stories,$allStoriesList )
  //Creates array of all the buttons created
  const favButton = document.querySelectorAll('.fav')
  let convertedFavButton = Array.from(favButton)
  convertedFavButton.forEach(button => {
    button.addEventListener('click', filterStory)
  })
  $allStoriesList.show();
}


async function addNewStory(e) {
  e.preventDefault()
  const title = $("#adding-title").val();
  const author = $("#adding-author").val();
  const url = $("#adding-url").val();
  let userToken = currentUser.loginToken
  let newStory = await StoryList.addStory(userToken, title, author, url)
  currentUser.ownStories.push(newStory)
  //After new story is submitted getAndShowStoriesOnStart() calls putStoriesOnStage() which creates a new list of stories and displays it.
  getAndShowStoriesOnStart()
  $addStorySection.hide()
  $favoriteStories.hide()
}
$addStorySection.on('submit', addNewStory)

// This function creates 'elements' from the added stories(ownStories) in currentUser.
//And checks to see if any of the added stories exist in currentUser.favorites. And modifies it if true.
function appendNewStoryToSection() {
  $addedStoriesSection.empty() 
  currentUser.ownStories.forEach(element => {
    let newGenerated = generateStoryMarkup(element)
    newGenerated.prepend($(`<span class='trash-container'><i class="fas fa-trash"></i></span>`))
    $addedStoriesSection.append(newGenerated)
  })
  makeYellow(currentUser.ownStories, $addedStoriesSection)
}


//this function obtains the clicked element and it's associated story.
function filterStory(e) {
  for (let story of storyList.stories) {
    if (e.target.parentElement.id == story.storyId) {
      let clickedElement = e.target
      addFav(story, clickedElement)
    }
  }
}

//  This function adds favorited story to database from allStoriesSection.
async function addFav(favStory, elementClicked) {
  //if clicked story(favStory) already exist in currentUser.favorites then remove it. Else add it.
  if (currentUser.favorites.some(st => favStory.storyId == st.storyId)) {
    let method = 'DELETE'  
    let favv = await currentUser.addOrDeleteFavoriteStory(method, favStory)
    currentUser.favorites = currentUser.favorites.filter(s => s.storyId != favStory.storyId);
    //This updates the elements on $allStoriesList(main page)
    elementClicked.className = 'fav'
    elementClicked.style.backgroundColor = 'rgb(77, 192, 92)'

  } else {
    let method = 'POST'
    let favv = await currentUser.addOrDeleteFavoriteStory(method, favStory)
    currentUser.favorites.push(favStory)
    elementClicked.className = 'fav clicked'
    elementClicked.style.backgroundColor = 'rgb(225, 241, 134)';

  }
}


//This function creates the favorited story elements and then adds it to the favorite section($favoriteStories).
function updateFavoriteDisplay() {
  $favoriteStories.empty()
  currentUser.favorites.forEach(added => {
    const $favAdded = generateStoryMarkup(added)
    $favAdded.children()[0].className = 'fav clicked'
    $favAdded.appendTo($favoriteStories)
  })
  // This eventHandler runs everytime a button on a favorited element in  the favorited section is clicked.
  //If the clicked element exists in the currentUser.favorite array, then remove it from currentUser favorites and the database.
  $favoriteStories.on('click', 'button', function (e) {
    currentUser.favorites.forEach(async (story, i) => {
      if (e.target.parentElement.id == story.storyId) {
        currentUser.favorites.splice(i, 1)
        let favv = await currentUser.addOrDeleteFavoriteStory('DELETE', story)
        updateFavoriteDisplay()
      }
    })
  })
}

// this function ensures the color and class names of favorited stories are updated on main page.
function makeYellow(array, section) {
  currentUser.favorites.forEach(y => {
      array.forEach(u => {
        if (y.storyId == u.storyId) {
          //The specific element in the specific section is chosen.
          let selectedElement = $(`#${section[0].id} #${u.storyId}`)
          let v = Array.from(selectedElement[0].children)
          //The child with the localName(tag type) of 'button' if chosen.
          let cElement = v.filter(q => q.localName == 'button')
          cElement[0].style.backgroundColor  = 'rgb(225, 241, 134)'
          cElement[0].className  = 'fav clicked'
      }
    })
  })
}

//This function adds favorited stories to database from addedStoriesSection.
$addedStoriesSection.on('click', 'button', async function (e) {
  let clickedStory = storyList.stories.filter(x => x.storyId == e.target.parentElement.id)  
    if (currentUser.favorites.some(element => e.target.parentElement.id == element.storyId )) {
      let method = 'DELETE'
      let fav = await currentUser.addOrDeleteFavoriteStory(method, clickedStory[0])
      e.target.style.backgroundColor = 'rgb(77, 192, 92)'
      e.target.className = 'fav'
      currentUser.favorites = currentUser.favorites.filter(s => s.storyId != clickedStory[0].storyId);

    } else {
      let method = 'POST'
      let fav = await currentUser.addOrDeleteFavoriteStory(method, clickedStory[0])
      currentUser.favorites.push(clickedStory[0])
      e.target.className = 'fav clicked'
      e.target.style.backgroundColor = 'rgb(225, 241, 134)'

    }
})

//This function removes added stories.
$addedStoriesSection.on('click', '.fas ',async function(e){
  //This updates favorites after story has been deleted.
  currentUser.favorites = currentUser.favorites.filter(x => x.storyId != e.target.parentElement.parentElement.id)
  let storyClicked = storyList.stories.filter(y => y.storyId == e.target.parentElement.parentElement.id) 
  let method = 'DELETE'
  let favorite = await currentUser.addOrDeleteFavoriteStory(method,storyClicked[0] )
  let request = await StoryList.deleteStory(currentUser.loginToken, e.target.parentElement.parentElement.id)
  currentUser.ownStories.forEach((story, i) => {
    if(e.target.parentElement.parentElement.id == story.storyId){
      currentUser.ownStories.splice(i,1)
    }
  })
  appendNewStoryToSection() 
  
})