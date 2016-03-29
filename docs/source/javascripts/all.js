/* global places */

places({
  container: document.querySelector('#landing-demo')
});

// The following code is used to change the color of the navigation
// depending the level of page scroll.
const hero = document.querySelector('.hero-section');
const navigation = document.querySelector('.navigation') ;
const height = hero.offsetHeight;
const navHeight = navigation.offsetHeight;
const sidebar = document.getElementById('sidebar');


// automatically darken the top menu when going down
document.addEventListener('scroll', scrollEvent => {
  const hero = document.querySelector('.hero-section');
  const navigation = document.querySelector('.navigation');
	const value = event.target.scrollingElement.scrollTop;

	if(value > height) {
		navigation.classList.add('darken');
	} else if(value > (height - navHeight)) {
		navigation.classList.add('init');
		navigation.classList.remove('darken');
	} else {
		navigation.classList.remove('darken','init');
	}

	const doc = document.querySelector('.documentation-section');
	if(doc){
		const paddingDoc = window.getComputedStyle(doc, null).getPropertyValue('padding-top').split('px')[0];
		// Fix the sidebar navigation
		if(value > ((height - navHeight) + parseInt(paddingDoc)) && sidebar) {
			sidebar.classList.add('fixed')
		} else {
			sidebar.classList.remove('fixed')
		}
	}
})

// document.addEventListener('scroll', function(event){
// 	const valuex = event.target.scrollingElement.scrollTop;
// 	if(valuex > ((height - navHeight) + parseInt(paddingDoc)) && sidebar) {
// 		sidebar.classList.add('fixed')
// 	} else {
// 		sidebar.classList.remove('fixed')
// 	}
// })
