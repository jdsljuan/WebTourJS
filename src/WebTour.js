const WEBTOUR_TAGNAME = 'webtour-tools';
const WEBTOUR_STEP_TAGNAME = 'webtour-step';

/**
 * class WebTour
 */
class WebTour extends HTMLElement{
    constructor(configObj){
        super();
        // -- SET FIELDS & LISTENERS -- 
        this.configTour(configObj);
    }

    // ----   
    configTour(configObj){
        this.tourname = configObj.title;
        this.steps = document.getElementsByTagName(WEBTOUR_STEP_TAGNAME);
        this.stepOrder = configObj.order;
        this.stepDuration = configObj.duration;
        this.autoTimer = undefined;
        this.status = this.steps.length == 0 ? false : true;
        this.actualStep = this.stepOrder[0];
        this.lastStep = undefined;
    }

    // ----
    startAutoTour(){
        this.actualStep = this.stepOrder[0];
        this.resumeAutoTour();
    }
    
    // ----
    resumeAutoTour(){
        if(this.autoTimer !== undefined){ return false; }
        this.showActualStep();
        this.autoTimer = setInterval(()=>{
            this.showNextStep();
        }, this.stepDuration);
        this.setAttribute('webtour-state', 'active');
    }
    
    // ----
    stopAutoTour(){
        this.actualStep = this.stepOrder[0];
        this.disableAllSteps();
        clearInterval(this.autoTimer);
        this.autoTimer = undefined;
        this.setAttribute('webtour-state', 'stopped');
    }
    
    // ----
    pauseAutoTour(){
        if(this.autoTimer == undefined){ return false; }
        clearInterval(this.autoTimer);
        this.autoTimer = undefined;
        this.setAttribute('webtour-state', 'paused');
    }

    // ----
    showNextStep(){
        this.actualStep = this.stepOrder[(this.stepOrder.indexOf(this.actualStep)+1)];
        this.showActualStep();
    }
    
    // ----
    showPreviousStep(){
        this.actualStep = this.stepOrder[(this.stepOrder.indexOf(this.actualStep)-1)];
        this.showActualStep();
    }

    // ----
    showActualStep(){
        try {
            this.disableAllSteps();
            this.connectedCallback();  // UPDATE Tools
            let stepElement = document.querySelector('[step-number="'+this.actualStep+'"]');
            let referenceElement = document.getElementById(stepElement.getAttribute('step-target'))

            referenceElement.setAttribute("webtour-targeted", "active");
            this.lastStep = referenceElement;

            var point = this.calculatePosition(referenceElement)
            stepElement.style.top  = point.y +"px";
            stepElement.style.left = point.x +"px";       

            stepElement.callEvent(); // Call the Event over this.eventTarget
            stepElement.setAttribute('step-state', 'active'); // Show it!!
        } catch (error) {
            this.stopAutoTour();
            this.connectedCallback(); // UPDATE Tools
        }
    }

    // ----
    disableAllSteps(){
        if(this.lastStep !== undefined){ this.lastStep.setAttribute("webtour-targeted", "disabled") }
        for (let index = 0; index < this.steps.length; index++) {
            this.steps.item(index).setAttribute('step-state', 'disabled')
        }
    }

    // ----
    calculatePosition(referElement){
        let stepElement = document.querySelector('[step-number="'+this.actualStep+'"]');
        let stepElementBoun = stepElement.getBoundingClientRect();
        let referenceElement = referElement.getBoundingClientRect();
        let point = { x: 0,  y: 0 };
        let dx = window.innerWidth-(referenceElement.left+referenceElement.width+stepElementBoun.width);        
        let dy = window.innerHeight-(referenceElement.top+referenceElement.height+stepElementBoun.height);
        if(dx >= 0){ point.x = referenceElement.left+referenceElement.width; }else{ point.x = referenceElement.left-stepElementBoun.width; }
        if(dy >= 0){ point.y = referenceElement.top+referenceElement.height; }else{ point.y = referenceElement.top-stepElementBoun.height; }
        return point;
    }

    // ----
    showTourPlayer(){
        this.remove();
        document.body.appendChild(this);
    }

    // ----
    hideTourPlayer(){
        this.stopAutoTour();
        this.remove();
    }

    /**
     * @override 
     */
    static get observedAttributes() {
    //    return ['webtour-name', 'webtour-steporder', 'webtour-stepduration'];
    }

    /**
     * @override 
     */
    connectedCallback() {
        let parts = [
            `<h1>${this.tourname}</h1>`,
            `<h2  onclick="this.parentNode.hideTourPlayer()">`+(this.stepOrder.indexOf(this.actualStep)+1)+`/`+this.stepOrder.length+`</h2>`,
            `<div onclick="this.parentNode.showPreviousStep()">&#9194;</div>`,
            `<div onclick="this.parentNode.resumeAutoTour()">&#9654;&#65039;</div>`,
            `<div onclick="this.parentNode.pauseAutoTour()"> &#9208;&#65039;</div>`,
            `<div onclick="this.parentNode.showNextStep()">	&#9193;</div>`,
            `<div onclick="this.parentNode.stopAutoTour()">  &#9209;&#65039;</div>`,
            `<div onclick="this.parentNode.hideTourPlayer()">&#128316;</div>`
        ];
        this.innerHTML = parts.join("");
    }

    /**
     * @override 
     */
    attributeChangedCallback(attributeName, oldValue, newValue){
    //    switch (attributeName) {
    //        case 'webtour-name':
    //            this.tourname = newValue;
    //            break;
    //        case 'webtour-steporder':
    //            this.stepOrder = newValue.toString().split(',')
    //            break;
    //        case 'webtour-stepduration':
    //            this.stepDuration = newValue;
    //            break;
    //        default:
    //            break;
    //    }
    }
}


/**
 * class WebTourStep
 */
class WebTourStep extends HTMLElement{
    constructor(){
        super();
        this.content = "";
        this.title = "";
        this.number = "";
        this.targetId = "";
        this.event = undefined
        this.eventTarget = "";
        this.state = "disabled";
    }
    
    callEvent(){
        if(this.event !== undefined) document.getElementById(this.eventTarget)[this.event]();
    }

    /**
     * @override 
     */
    static get observedAttributes() {
        return ['step-content', 'step-number', 'step-title', 'step-state', 'step-target', 'step-eventtarget', 'step-event'];
    }

    /**
     * @override 
     */
    connectedCallback() {
        this.innerHTML = `<h1>${this.title}</h1><p>${this.content}</p>`;
    }

    /**
     * @override 
     */
    attributeChangedCallback(attributeName, oldValue, newValue){
        switch (attributeName) {
            // Fields
            case 'step-content':
                this.content = newValue;
                break;
            case 'step-number':
                this.number = newValue;
                break;
            case 'step-title':
                this.title = newValue;
                break;
            case 'step-state':
                this.state = newValue;
                break;
            // Events
            case 'step-event':
                this.event = newValue;
                break;
            // Targets 
            case 'step-target':
                this.targetId = newValue;
                break;
            case 'step-eventtarget':
                this.eventTarget = newValue;
                break;
            default:
                break;
        }
    }
}

/**
 * DON'T TOUCH ME
 */
window.customElements.define(WEBTOUR_TAGNAME, WebTour);
window.customElements.define(WEBTOUR_STEP_TAGNAME, WebTourStep);
