import React, { useState } from 'react';
import './AddToHomeScreenModalStyle.scss';
import { isInStandaloneMode } from '../../utils/isInStandaloneMode';
import { Button, Dialog, Paper } from '@material-ui/core';
import logo from '../../logo.png';
import ShareIcon from '../../assets/images/ShareIcon.svg';
import AndroidChromeMenu from '../../assets/images/AndroidChromeMenu.svg';
import AddToHomeScreenIcon from '../../assets/images/AddToHomeScreenIcon.svg';
import { useIntl } from '../../intl';
import { isAndroid, isMobile, isIOS, isIPad13 } from 'react-device-detect';

export default function AddToHomeScreenModal() {
  const intl = useIntl();

  const [modalShow, setModalShow] = useState(() => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const lastShowedAddToHomeScreenModal = JSON.parse(
      localStorage.getItem('lastShowedAddToHomeScreenModal')
    );
    if (lastShowedAddToHomeScreenModal) {
      return (
        Date.now() - lastShowedAddToHomeScreenModal >
        ONE_DAY * process.env.REACT_APP_ADD_TO_HOME_SCREEN_MODAL_AFTER_DAYS
      );
    } else {
      return true;
    }
  });

  const handleOnCloseButtonClick = () => {
    localStorage.setItem(
      'lastShowedAddToHomeScreenModal',
      JSON.stringify(Date.now())
    );
    setModalShow(false);
  };

  const renderInThisDevice =
    (process.env.REACT_APP_ADD_TO_HOME_SCREEN_MODAL_ANDROID === 'true' &&
      isAndroid) ||
    (process.env.REACT_APP_ADD_TO_HOME_SCREEN_MODAL_IOS === 'true' &&
      (isMobile || isIPad13));

  const shouldRender = renderInThisDevice && modalShow && !isInStandaloneMode();

  //TODO Add time for modal show again

  return (
    <div>
      {shouldRender && (
        <Dialog fullScreen open={modalShow} className="add-to-home-screen">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <h3 className="flex-column perfect-center">
            {isAndroid && intl.formatMessage('add-to-home.android.title')}
            {(isIOS || isIPad13) && intl.formatMessage('add-to-home.ios.title')}
          </h3>
          <Paper className="steps flex-column perfect-center">
            <span>
              {(isIOS || isIPad13) &&
                intl.formatMessage('add-to-home.ios.step1.first')}
              {(isIOS || isIPad13) && (
                <img className="share-icon" src={ShareIcon} alt="Share" />
              )}
              {isAndroid &&
                intl.formatMessage('add-to-home.android.step1.first')}
              {isAndroid && (
                <img
                  className="chrome-menu"
                  src={AndroidChromeMenu}
                  alt="Menu"
                />
              )}
              {intl.formatMessage('add-to-home.ios.step1.end')}
            </span>
            <span>
              {intl.formatMessage('add-to-home.step2.first')}
              {(isIOS || isIPad13) && (
                <img
                  className="add-to-home-screen-icon"
                  src={AddToHomeScreenIcon}
                  alt="Add To Home Screen"
                />
              )}
              {isAndroid && (
                <span className="add-to-home-screen-icon">
                  {intl.formatMessage(
                    'add-to-home.android.step2.add-to-home-screen'
                  )}
                </span>
              )}
              {intl.formatMessage('add-to-home.step2.end')}
            </span>
            <span>{intl.formatMessage('add-to-home.step3.first')}</span>
          </Paper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOnCloseButtonClick}
          >
            {intl.formatMessage('add-to-home.add-later')}
          </Button>
        </Dialog>
      )}
    </div>
  );
}
