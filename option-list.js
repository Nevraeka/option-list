(function (document, window) {

  if (!window.customElements || !HTMLElement.prototype.attachShadow) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-sd-ce.js', loadComponents)
  } else {
    loadComponents();
  }

  function loadComponents(){
    if(!window.customElements.get('img-icon')) {
      loadScript('https://cdn.rawgit.com/Nevraeka/img-icon/master/img-icon.js', loadOptionList);
    } else {
      loadOptionList();
    }
  }

  function loadScript(url, callback) {
    const script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState) {
      script.onreadystatechange = function () {
        if (script.readyState === "loaded" || script.readyState === "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function () { callback() };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  function loadOptionList() {
    if (!!!window.customElements.get('option-list')) {
      window.customElements.define('option-list',
        class OptionList extends HTMLElement {

          static get observedAttributes() { return ['class', 'style', 'caret']; }

          get info() { return Object.freeze({ dependencies: [], name: 'option-list', version: 'v1.2.0' }); }

          constructor() {
            super();
            this._root = null;
            this._state = { selectedIndex: 0 };
          }

          connectedCallback() {
            if (this._root === null) {
              if (!!this.attachShadow) { this._root = this.attachShadow({ mode: "open" }); }
              else { this._root = this; }
            }
            render(this);
           
            Array.from(this.children, (item, indx, arr) => {
               
              if (item.getAttribute('selected')) {
                return this._state.selectedIndex = indx;
              }
              return item.removeAttribute('selected');
            });
           
          }

          attributeChangedCallback(name, oldValue, newValue) {
            if (newValue === oldValue) { return };
            if (name === 'caret') {
              if(this._root !== null) {
                this._root.querySelector('.listbox').className = `listbox  ${newValue.replace(' ', '-').toLowerCase()}`; }
              }          
            }
        });
    }
  }

  function render(component) {
    if (window.ShadyCSS) ShadyCSS.styleElement(this);
    let $template = document.createElement("template");
    $template.innerHTML = `
      <style>
        :host {
          --img-icon--base-color: rgba(255,255,255,0); 
          --img-icon--color: #3777bc;
          display: block;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Roboto', Helvetica, Arial, sans-serif;
          position: relative;
          font-size: 14px;
          overflow: visible;
          cursor: pointer;
          font-weight: 300;
        }

        .listbox {
          position: relative;
          z-index: 99999;
          margin: 0;
          padding: 0;
          overflow: visible;
          box-sizing: border-box;
          box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
          border-radius: 4px;
          border: 1px solid #e0e0e0;
          width: 100%;
        }

        ::slotted(li) { 
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 8px 16px;
          background-color: #fff;
          transition: background-color .2s;
          font-family: 'Roboto', Helvetica, Arial, sans-serif;
          font-size: 14px;
          overflow: visible;
          cursor: pointer;
          font-weight: 300;
          width: 100%;   
        }

       .listbox:before {
         content: "";
         border: 7px solid transparent;
         border-bottom-color: #e0e0e0;
         position: absolute;
         left: 25px;
         top: -14px;
        }
        
        .listbox:after {
          left: 26px;
          top: -12px;
          content: "";
          border: 6px solid transparent;
          border-bottom-color: #fff;
          position: absolute;
        }

        ::slotted(li:hover) {
          background: #eee;
        }

        ::slotted(li[selected]),
        ::slotted(li[selected]:hover) {
          color: #3777bc;
        }
      </style>
      <ol class="listbox">
        <slot></slot>
      </ol>
    `;

    if (window.ShadyCSS) ShadyCSS.prepareTemplate($template, 'checkbox-input');
    component._root.appendChild(document.importNode($template.content, true));
    
    const nodes = component._root.querySelector('slot').assignedNodes();
    const elemNodes = Array.from(nodes).filter((nd) => nd.nodeType === 1);
    
    elemNodes.forEach((elem, indx) => {
    
      if(!elem.querySelector('img-icon')) {
        elem.innerHTML += `<img-icon shape="checkmark" class="img-icon" fill="${elem.getAttribute('selected') === 'true' ? 100 : 0}" style="margin: 0 0 0 auto;"></img-icon>`;
      }
      const handleClick = (evnt) => {
        const imgIcon = elem.querySelector('img-icon');

        const optionSelectedEvent = new CustomEvent('optionSelected', {
          bubbles: true,
          composable: true,
          detail: { index: indx, value: (elem.getAttribute('value') || elem.innerHTML) }
        });

        const optionDeselectedEvent = new CustomEvent('optionDeselected', {
          bubbles: true,
          composable: true,
          detail: { index: indx, value: (elem.getAttribute('value') || elem.innerHTML) }
        });

        elemNodes.forEach((optEl) => {
          if(optEl !== elem) { 
            const imgIcn = optEl.querySelector('img-icon');
            if(imgIcn) { imgIcn.setAttribute('fill', '0'); }
            optEl.removeAttribute('selected'); 
          }
        });
        if(elem.getAttribute('selected')){
          elem.removeAttribute('selected');
          if(imgIcon) { imgIcon.setAttribute('fill', '0'); }
          component._state.selectedIndex = 0;
          component.dispatchEvent(optionDeselectedEvent);
        } else {
          elem.setAttribute('selected', 'true');
          if(imgIcon) { imgIcon.setAttribute('fill', '100'); }
          component._state.selectedIndex = indx;
          component.dispatchEvent(optionSelectedEvent);
        }
      };
      elem.removeEventListener('click', handleClick.bind(component));
      elem.addEventListener('click', handleClick.bind(component));
    }, component);
  }

})(document, window);