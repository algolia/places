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

// Responsive navigation
const theSelect = document.createElement('select');
let winWidth = window.innerWidth;

function selectizer(){
   // Let's make the select
   var isSelect = document.getElementById('selectNav');
   theSelect.id = "selectNav";
   theSelect.classList.add('no-desktop');

  if(!isSelect) {
    document.querySelector('.navigation').appendChild(theSelect)
  }

   const links = document.querySelectorAll('.menu li a');

   for(let i = 0;i<links.length;i++) {

   	var option = document.createElement("option");
   	option.text = links[i].textContent;
   	option.value = links[i].href;
   	theSelect.appendChild(option)
   }

   checkWidth()
 }

 window.onload = function() {
 	selectizer()
 }

 window.onresize = function() {
 	winWidth = window.innerWidth;
 }

 theSelect.addEventListener('change', function(event){
 	var value = this.options[this.selectedIndex].value;
 	window.location = value;
 })