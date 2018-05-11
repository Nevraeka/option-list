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

          static get observedAttributes() { return ['caret', 'max-select']; }

          get info() { return Object.freeze({ name: 'option-list', version: 'v0.1.0' }); }

          constructor() {
            super();
            this._root = null;
            this._state = { maxSelect: 1, selectedIndices: [] };
          }

          connectedCallback() {
            if (this._root === null) {
              if (!!this.attachShadow) { this._root = this.attachShadow({ mode: "open" }); }
              else { this._root = this; }
            }
            render(this);
            Array.from(this.querySelectorAll('option'), (item, indx, arr) => {
              if (item.getAttribute('selected')) { this._state.selectedIndices.push(indx); }
            });            this._root.querySelector('#slot').addEventListener('slotchange', slotChangeHandler.bind(this));
          }

          disconnectedCallback(){
            this._root.querySelector('#slot').removeEventListener('slotchange', slotChangeHandler.bind(this));
          }

          attributeChangedCallback(name, oldValue, newValue) {
            if (newValue === oldValue) { return };
            if (name === 'max-select') {
              const parsedVal = parseInt(newValue, 10);
              this._state.maxSelect = !!parsedVal ? parsedVal : 1;
            }
            if (name === 'caret') {
              if(this._root !== null) {
                this._root.querySelector('.option__list').className = `option__list ${newValue.replace(' ', '-').toLowerCase()}`; }
              }          
            }
        });
    }
  }

  function render(elemInstance) {
    elemInstance._root.innerHTML = `
      <style>
        :host {
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
          width: 100%;
          max-width: 600px;
        }

        ::slotted(option) {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background-color: #fff;
          transition: background-color .2s
        }

        .option_list {
          overflow: visible;
          box-sizing: border-box;
          box-shadow: 0 2px 4px 0 rgba(0,0,0,.2);
          border-radius: 4px;
          border: 1px solid #e0e0e0;
          width: 100%;
          max-width: 600px;
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

        ::slotted(option:hover) {
          background: #eee;
        }

        ::slotted(option[selected]),
        ::slotted(option[selected]:hover) {
          color: #3777bc;
        }
      </style>
      <div class="option_list"> 
        <slot id="slot"></slot>
      </div>
    `;
  }

  function slotChangeHandler(evt) {
    const nodes = evt.target.assignedNodes();
    const elemNodes = Array.from(nodes).filter((nd) => nd.nodeType === 1 && nd.tagName === 'OPTION');

    elemNodes.forEach((elem, indx) => {
      const handleClick = (evnt) => {
        const optionSelectedEvent = new CustomEvent('optionSelected', {
          bubbles: true,
          composable: true,
          detail: {
            index: indx,
            value: (elem.getAttribute('value') || elem.innerText)
          }
        });

        const optionDeselectedEvent = new CustomEvent('optionDeselected', {
          bubbles: true,
          composable: true,
          detail: {
            index: indx,
            value: (elem.getAttribute('value') || elem.innerText)
          }
        });

        const index = this._state.selectedIndices.indexOf(indx);
        if (index === -1) {
          if (this._state.selectedIndices.length < this._state.maxSelect) {
            this._state.selectedIndices.push(indx);
            evnt.target.setAttribute('selected', 'true');
            this.dispatchEvent(optionSelectedEvent);
          }
        } else {
          evnt.target.removeAttribute('selected');
          delete this._state.selectedIndices[index];
          this._state.selectedIndices = this._state.selectedIndices.filter((item) => !!item);
          this.dispatchEvent(optionDeselectedEvent);
        }
      };
      elem.removeEventListener('click', handleClick.bind(this));
      elem.addEventListener('click', handleClick.bind(this));
    }, this);
  };

})(document, window);