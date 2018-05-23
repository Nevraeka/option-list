(function (document, window) {

  if (!window.customElements || !HTMLElement.prototype.attachShadow) {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/1.2.0/webcomponents-sd-ce.js', loadOptionList)
  } else {
    loadOptionList();
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

          static get observedAttributes() { return ['class', 'style', 'caret', 'max-select']; }

          get info() { 
            return Object.freeze({
              dependencies: [],
              name: 'option-list',
              version: 'v1.0.0'
            });
          }

          constructor() {
            super();
            this._state = {
              childList: [],
              maxSelect: 1,
              selectedIndices: []
            };
          }

          connectedCallback() {
            render(this);
            
            this.observer = new MutationObserver(function(mutations) {
      console.log('dfsdfsdf');
      mutations.forEach(function(mutation) {
        this._state.childList = Array.from(this.children).filter((item)=> item.nodeType === 1 && item.tagName === 'OPTION')
        ;
        childrenUpdated(this);            
      }, this);
    }, this);
    this.observer.observe(this, { attributes: true, childList: true, characterData: true });
  
            // Array.from(this.querySelectorAll('option'), (item, indx, arr) => {
            //   if(this._state.selectedIndices.length <= this._state.maxSelect) {
            //     if (item.getAttribute('selected')) {
            //       this._state.selectedIndices.push(indx);
            //     } else {
            //       item.removeAttribute('selected');
            //     }
            //   }
            // });
          }

          disconnectedCallback(){ this.observer.disconnect(); }

          attributeChangedCallback(name, oldValue, newValue) {
            if (newValue === oldValue) { return };
            if (name === 'max-select') {
              const parsedVal = parseInt(newValue, 10);
              this._state.maxSelect = !!parsedVal ? parsedVal : 1;
            }
            if (name === 'caret') {
              if(!!this.querySelector('.option_list')) {
                this.querySelector('.option_list').className = `option_list ${newValue.replace(' ', '-').toLowerCase()}`; }
              }          
            }
        });
    }
  }

  function render(elemInstance) {
    elemInstance._state.childList = Array.from(elemInstance.children).filter((item)=> item.nodeType === 1 && item.tagName === 'OPTION');
    const innerWrapper = document.createElement('div');
    const css = document.createElement('style');
    css.appendChild(document.createTextNode(""));
    css.innerHTML = `
      option-list {
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

      .option-list {
        overflow: visible;
        box-sizing: border-box;
        box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
        border-radius: 4px;
        border: 1px solid #e0e0e0;
        width: 100%;
        position: relative;
        top: 7px;
      }

      .top-left:before {
        content: "";
        border: 7px solid transparent;
        border-bottom-color: #e0e0e0;
        position: absolute;
        left: 25px;
        top: -14px;
      }

      .top-left:after {
        left: 26px;
        top: -12px;
        content: "";
        border: 6px solid transparent;
        border-bottom-color: #fff;
        position: absolute;
      }

      option {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        display: flex;
        box-sizing: border-box;
        align-items: center;
        padding: 8px 16px;
        background-color: #fff;
        transition: background-color .2s
      }

      option:hover {
        background: #eee;
      }

      option[selected],
      option[selected]:hover {
        color: #3777bc;
      }
    `;
    innerWrapper.className = `option-list ${(!!elemInstance.getAttribute('caret') ?  elemInstance.getAttribute('caret') : '').replace(' ', '-').toLowerCase()}`; 
    elemInstance.innerHTML = '';
    elemInstance.appendChild(css);
    elemInstance.appendChild(innerWrapper);
    childrenUpdated(elemInstance);
    console.log(elemInstance.innerHTML)
  }

  function childrenUpdated(component) {
    component._state.childList.forEach((opt)=> component.querySelector('.option-list').appendChild(opt) );
    const optionElements = Array.from(component.querySelectorAll('option'));
    optionElements.forEach((elem, indx) => {
      const handleClick = (evnt) => {
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

        if(component._state.maxSelect === 1) {
          optionElements.forEach((optEl) => optEl.removeAttribute('selected'));
          evnt.target.setAttribute('selected', 'true');
          component._state.selectedIndices = [indx];
          component.dispatchEvent(optionSelectedEvent);
        } else {
          const index = component._state.selectedIndices.indexOf(indx);
          if (index === -1) {
            if (component._state.selectedIndices.length < component._state.maxSelect) {
              component._state.selectedIndices.push(indx);
              evnt.target.setAttribute('selected', 'true');
              component.dispatchEvent(optionSelectedEvent);
            }
          } else {
            evnt.target.removeAttribute('selected');
            delete component._state.selectedIndices[index];
            component._state.selectedIndices = component._state.selectedIndices.filter((item) => !!item);
            component.dispatchEvent(optionDeselectedEvent);
          }
        }
      };
      elem.removeEventListener('click', handleClick.bind(component));
      elem.addEventListener('click', handleClick.bind(component));
    }, component);
  };

})(document, window);