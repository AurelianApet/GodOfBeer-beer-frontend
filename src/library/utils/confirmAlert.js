import { confirmAlert } from 'react-confirm-alert';
import React from 'react';
import cn from 'classnames';
import $ from 'jquery';

function handleKeyUp (e){
  if (e.key === 'Enter') {
    $('#confirm-alert-ok').trigger('click');
  }
}

export const confirmAlertMsg = (aParam, aPathname) => { 
  const handleConfirm = (onClose, e) => {
    if (aParam.confirmFunc) {
      aParam.confirmFunc(e);
    }
    onClose();
    document.removeEventListener('keyup', handleKeyUp);
  };
  const handleCancel =(onClose, e) => {
    if(aParam.cancelFunc) aParam.cancelFunc(e);
    onClose();
    document.removeEventListener('keyup', handleKeyUp);
  }
  document.addEventListener('keyup', handleKeyUp);
  confirmAlert({
    customUI: ({ onClose }) => {

      let sClassName="";
      if (aPathname.indexOf('/teaching-admin') !== -1) {
        sClassName="confirm-admin";
      }
      if (aPathname.indexOf('/teaching-support') !== -1) {
        sClassName="confirm-support";
      }
      if (aPathname.indexOf('/teaching-evaluation') !== -1) {
        sClassName="confirm-evaluation";
      }
      if (aPathname.indexOf('/account') !== -1) {
        sClassName="confirm-account";
      }
      let cautionIcon = "";
      if (aParam.icon) {
        // red, yellow, ...
        cautionIcon = aParam.icon;
      }
      return (
        <div className={aParam.className}>
          <div className={sClassName}>
            <div className="modal-body-cus">
              <h4><i className={cn("fa", "fa-exclamation-triangle", "confirm-preicon", cautionIcon)}/>{aParam.title}</h4>
              <pre>{aParam.detail}</pre>
              { aParam.noTitle && aParam.noTitle !== "" &&
                <button
                  className='confrim-cancel-button'
                  onClick={handleCancel.bind(this, onClose)}
                >
                  {aParam.noTitle}
                </button>
              }
              <button
                id='confirm-alert-ok'
                className='confrim-ok-button'
                onClick={handleConfirm.bind(this, onClose)}
              >
                {aParam.confirmTitle}
              </button>
            </div>
          </div>
        </div>
      );
    }
  });
}

