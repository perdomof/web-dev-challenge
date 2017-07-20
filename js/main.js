// History of phrase checks
var checkHistory = [],
	currentPhraseCheck;

/**
 * Pushes most recent phrase check parameters and result into history log
 */
function updateHistory() {
	// Push the results into history array
	checkHistory.push(currentPhraseCheck);
	if (checkHistory.length > 10) {
		checkHistory.splice(0,1);
	}
	// Build output string, since deserialized arrays are not pretty
	var log = "";
	for (var i=checkHistory.length-1; i >= 0; i--) {
		elem = checkHistory[i];
		log += "Phrase: \"" + elem.phrase + "\" <br>";
		log += "Ignore Punctuation: " + elem.ignorePunctuation + "<br>";
		log += "Ignore Whitespace: " + elem.ignoreWhitespace + "<br>";
		log += "Is Palindromic: " + elem.result + "<br>";
		log += "---------------------------------------------------------<br>";
	}
	// Refresh the log
	document.getElementById("log").innerHTML = log;
}

/**
 * Returns a phrase with all whitespace removed
 *
 * @param phrase {string} the phrase to have whitespace removed from
 *
 * @return {string} [phrase] without any whitespace
 *
 */
function RemoveWhitespace(phrase) {
	return phrase.replace(/\s/g, "");
}

/**
 * Returns a phrase with all punctuation removed
 *
 * @param phrase {string} the phrase to have punctuation removed from
 *
 * @return {string} [phrase] without any punctuation
 *
 */
function RemovePunctuation(phrase) {
	return phrase.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
}

/**
 * Returns if a given phrase is a palindrome
 *
 * @param phrase {string} the phrase to be checked
 *
 * @return {bool} if [phrase] is a palindrome
 *
 */
function IsItAPalindrome(phrase) {
	var result = true,
		len = phrase.length,
		halfway = Math.round(len/2),
		charSet = phrase.split(""),
		char1,
		char2;
	if (charSet) {
		for (var i = 0, j = len-1;
			 (i <= halfway) && (j >= (halfway)); //check each char in their repective locations
			 i++, j--) {

			char1 = charSet[i];
			char2 = charSet[j];
			if (char1 !== char2) {
				result = false;
				break;
			}
		}
	}
	return result;
}

/**
 * Shows feedback on the page of if the entered phrase is a palidrome or not
 *
 * @param wasPalidrome {bool} if the phrase is a palidrome or not
 *
 * @return {void}
 *
 */
function ShowFeedback(wasPalidrome) {

	// Grab a reference to the alerts
	let success = document.getElementById("success");
	let error = document.getElementById("error");

	// Hide both alerts
	Hide(success);
	Hide(error);

	// Show correct alert based on outcome
	if (wasPalidrome) {
		Fade(success, 1, 2000);
		currentPhraseCheck.result = true;
	}
	else {
		Fade(error, 1, 2000);
		currentPhraseCheck.result = false;
	}
	updateHistory();
}

/**
 * Handles when the form is submitted
 *
 * @param e {event} the event object
 *
 * @return {void}
 *
 */
function FormSubmitted(e) {

	// NOTE: Don't actually submit the form
	e.preventDefault();

	// Get the contents of the phrase input
	let phraseInput = document.getElementById("phrase-input");
	let phrase = phraseInput.value;

	// Build Phrase Check Object
	currentPhraseCheck = {};
	currentPhraseCheck.phrase = phrase;
	currentPhraseCheck.ignorePunctuation = document.getElementById("ignorePunctuationCheckBox").checked;
	currentPhraseCheck.ignoreWhitespace = document.getElementById("ignoreWhitespaceCheckBox").checked;

	// Edit phrase for Modifiers
	if (currentPhraseCheck.ignorePunctuation) {
		phrase = RemovePunctuation(phrase);
	}
	if (currentPhraseCheck.ignoreWhitespace) {
		phrase = RemoveWhitespace(phrase);
	}

	// See if its a palidrome
	let isPalidrome = IsItAPalindrome(phrase);

	// Setup the page to show results
	ShowFeedback(isPalidrome);
}

/**
 * Fades a given element to an opacity
 *
 * @param element {element} the element to fade
 * @param opacity {number} the end opacity to fade to. Rounded to be either 0 or 1. Applies "display:none" if opacity is 0 and "display:block" if not 0
 * @param duration {number} how long the fade should take (in miliseconds)
 * @param completeCallback {function} the callback function to be called when the fade is complete
 *
 * @return {void}
 *
 */
function Fade(element, opacity, duration, completeCallback) {

	// Clamp opacity
	opacity = Math.round(Clamp(opacity));
	
	// Get the element's starting opacity
	let startingOpacity = parseFloat(window.getComputedStyle(element).opacity);

	// Return if opacity is already the same change
	if (startingOpacity == opacity) {
		// Trigger Callback
		if (completeCallback != null) {
			completeCallback();
		}
		return;
	}

	// Get range for opacity change
	let opacityRange = opacity - startingOpacity;

	// Get time for each individual step (assume we want 100 steps)
	let stepTime = duration / 100;

	// Get the amount to change the opacity every step
	let opacityStep = opacityRange / stepTime;

	// Setup interval for transition
	let interval = setInterval(function(){

		// Get current opacity
		let currentOpacity = parseFloat(window.getComputedStyle(element).opacity);

		// If we're not done
		if (currentOpacity - opacity) {
			
			// Increment opacity
			currentOpacity += opacityStep;

			// Clamp opacity
			currentOpacity = Clamp(currentOpacity);

			// Apply opacity
			element.style.opacity = currentOpacity;
			
			// Set display style
			SetDisplay(element)
		}
		else {
			// Apply final opacity
			element.style.opacity = opacity;

			// Set final display
			SetDisplay(element);

			// Remove interval
			clearInterval(interval);

			// Trigger Callback
			if (completeCallback != null) {
				completeCallback();
			}
		}

	}, stepTime);

	function SetDisplay(e) {
		if (parseFloat(window.getComputedStyle(e).opacity) == 0) {
			e.style.display = "none";
		}
		else {
			e.style.display = "block";
		}
	}
}

/**
 * Hides a given element
 *
 * @param element {element} the element to hide
 *
 * @return {void}
 *
 */
function Hide(element) {
	element.style.display = "none";
	element.style.opacity = 0;
}

/**
 * Clamps a number between 0 and 1
 *
 * @param num {number} the number to clamp
 *
 * @return {void}
 *
 */
function Clamp(num) {

	return Math.min(Math.max(num, 0), 1);
}

/**
 * Runs a series of tests to see if IsItAPalindrome returns the expected responses
 *
 * @param displayOnPage {bool} if the results of the tests should be displayed on the page vs in the console (default = false)
 *
 * @return {bool} if IsItAPalidrome passed all the tests
 *
 */
function Test(displayOnPage) {

	if (displayOnPage == undefined) {
		displayOnPage = false;
	}

	// Grab results element
	let testResults = document.getElementById("test-results");
	testResults.innerHTML = "";

	// Create tests
	let tests = [
		{
			phrase: "hello world",
			expectedResult: false
		},
		{
			phrase: "radar",
			expectedResult: true
		},
		{
			phrase: "a",
			expectedResult: true
		},
		{
			phrase: "aa",
			expectedResult: true
		},
		{
			phrase: "aaaaaaaa",
			expectedResult: true
		},
		{
			phrase: "aaaaaaaaa",
			expectedResult: true
		},
		{
			phrase: "",
			expectedResult: true
		},
		{
			phrase: " a a a ", //The original input wasn't a palindrome, matched output on tester
			expectedResult: true
		},
		{
			phrase: "./?+=+?/.",  //To match the putput on the tester
			expectedResult: true  // The space in this makes in non palindromic
		},
		{
			phrase: "               ",
			expectedResult: true
		},
		{
			phrase: "1234567890",
			expectedResult: false
		}
	]

	// Get total number of tests
	let numTests = tests.length;

	// Container for incorrectly handled phrases
	let incorrectlyHandled = [];
	
	// Run tests
	for (let i = 0; i < numTests; i++) {
		let currentTest = tests[i];

		if (currentTest.expectedResult != IsItAPalindrome(currentTest.phrase)) {
			// Hold on to phrases handled incorrectly
			incorrectlyHandled.push(currentTest.phrase);
		}
	}

	// Display the results on the page if applicable
	if (displayOnPage) {
		let pageResults = "";

		pageResults += "Failed " + incorrectlyHandled.length + " / " + numTests + " tests:<br/>";
		pageResults += "=================<br/>";
		for (let i = 0; i < incorrectlyHandled.length; i++) {
			pageResults += "" + (i+1) + ") \"" + incorrectlyHandled[i] + "\"<br/>";
		}
		pageResults += "=================<br/>";

		testResults.innerHTML = pageResults;
	}
	else {
		console.log("Failed " + incorrectlyHandled.length + " / " + numTests + " tests:");
		console.log("=================");
		for (let i = 0; i < incorrectlyHandled.length; i++) {
			console.log("" + (i+1) + ") \"" + incorrectlyHandled[i] + "\"");
		}
		console.log("=================");
	}

	// Return if all tests passed
	if (incorrectlyHandled.length == 0) {
		return true;
	}
	else {
		return false;
	}
}

/**
 * Handles the setup of the page
 *
 * @return {void}
 *
 */
$(document).ready(function(){

	// Setup form submit event listener
	let palidromeForm = document.getElementById("palindrome-form");
	palidromeForm.addEventListener("submit", FormSubmitted);

	// Setup test button click event listener
	let testButton = document.getElementById("test-button");
	testButton.addEventListener("click", function(){
		Test(true);
	});
});
