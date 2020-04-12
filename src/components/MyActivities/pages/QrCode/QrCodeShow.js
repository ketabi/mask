import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from '@material-ui/core';
import { KeyboardBackspace } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import QrCode from 'qrcode.react';
import { showNav } from '../../../../redux/actions/CommonActions';
import './QrCode.scss';
import logo from '../../../../logo-header.png';

export default function QrCodeShow() {
  let history = useHistory();
  const dispatch = useDispatch();
  const unique_id = useSelector((state) => state.MyActivities.user.unique_id);

  return (
    <>
      <AppBar position="static" className="activity-header">
        <Toolbar>
          <img alt="mask" src={logo} className="app-header-logo" />
          <IconButton
            color="inherit"
            onClick={() => {
              dispatch(showNav());
              history.push('/my-activities');
            }}
          >
            <KeyboardBackspace />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box className="qr-code-box">
        <QrCode value={'person:' + unique_id} />
      </Box>
      <Box className="warning-box">
        <Typography>
          در صورتی که با فردی ملاقت کرده‌اید، فرد مقابل بایستی با استفاده از
          آیکون دوربین در اپلیکیشن خود این صفحه را تصویربرداری کند.
        </Typography>
        <Typography component="span" variant="caption">
          این کد حاوی هیچ گونه اطلاعات شخصی یا درمانی شما نیست و تنها جهت
          شناسایی شما در نرم‌افزار استفاده می‌شود.
        </Typography>
      </Box>
    </>
  );
}
