import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import { IconButton, Menu, MenuItem, Typography, Button } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';
import MenuIcon from '@material-ui/icons/Menu';
import { logout } from '@pega/auth/lib/sdk-auth-manager';
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import './WssNavBar.css';

interface WssNavBarProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  appInfo: any;
  navLinks: any[];
  operator: { currentUserInitials: string };
  navDisplayOptions: { alignment: string; position: string };
  // eslint-disable-next-line react/no-unused-prop-types
  portalName: string;
  imageSrc: string;
  // eslint-disable-next-line react/no-unused-prop-types
  fullImageSrc: string;
  appName: any;
}

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  appListLogo: {
    width: '3.6rem'
  },
  appName: {
    color: 'white',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(4),
    fontSize: '1.5rem'
  }
}));

export default function WssNavBar(props: WssNavBarProps) {
  const { appInfo, navLinks, operator, navDisplayOptions } = props;
  const { alignment, position } = navDisplayOptions;
  const classes = useStyles();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'AppShell';

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const navLinksContent = (
    <Box id='nav-links' sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }} style={{ justifyContent: alignment }}>
      {navLinks.map(link => (
        <Button className='link-style' key={link.text} onClick={link.onClick}>
          {link.text}
        </Button>
      ))}
    </Box>
  );

  return (
    <div id='NavBar' className='nav-bar'>
      <AppBar position='static' color='primary'>
        <Container maxWidth='xl'>
          <Toolbar disableGutters style={{ justifyContent: 'space-between' }}>
            <Button id='appName' style={{ textTransform: 'capitalize' }} onClick={appInfo.onClick}>
              <img src={appInfo.imageSrc} className={classes.appListLogo} />
              <span className={classes.appName}>{appInfo.appName}</span>
            </Button>
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size='small'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleOpenNavMenu}
                color='inherit'
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id='menu-appbar'
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left'
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
              >
                {navLinks.map(link => (
                  <MenuItem key={link.text} onClick={link.onClick}>
                    <Typography>{link.text}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {position === 'inline' && <>{navLinksContent}</>}

            <Box sx={{ flexGrow: 0 }}>
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar>{operator.currentUserInitials}</Avatar>
              </IconButton>
              <Menu
                id='menu-appbar'
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={logout}>
                  <Typography>{localizedVal('Log off', localeCategory)}</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
          {position === 'below' && <>{navLinksContent}</>}
        </Container>
      </AppBar>
    </div>
  );
}
