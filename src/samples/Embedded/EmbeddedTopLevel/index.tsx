/* eslint-disable react/button-has-type */
import { useState, useEffect } from 'react';
import { render } from 'react-dom';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, ThemeProvider } from '@material-ui/core/styles';
import { sdkIsLoggedIn, loginIfNecessary, sdkSetAuthHeader, sdkSetCustomTokenParamsCB, getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';

import EmbeddedSwatch from '../EmbeddedSwatch';
import { compareSdkPCoreVersions } from '@pega/react-sdk-components/lib/components/helpers/versionHelpers';

import { getSdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import localSdkComponentMap from '../../../../sdk-local-component-map';
import { theme } from '../../../theme';
import { Button } from '../../../design-system/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../design-system/ui/carousel';
import { Header } from '../../../design-system/header';

declare const myLoadMashup: any;

// eslint-disable-next-line @typescript-eslint/no-shadow
const useStyles = makeStyles(theme => ({
  embedTopRibbon: {
    display: 'none',
    alignItems: 'center',
    height: '64px',
    padding: '0px 20px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  embedTopIcon: {
    width: '40px',
    filter: 'invert(100%)'
  },
  embedMainScreen: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },
  embedBanner: {
    textAlign: 'center',
    width: '100%',
    padding: '20px'
  },
  embedShoppingOptions: {
    display: 'flex',
    justifyContent: 'space-evenly'
  },
  pegaPartInfo: {
    display: 'none',
    flexDirection: 'row'
  },
  pegaPartPega: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column'
  },
  pegaPartText: {
    paddingLeft: '50px'
  },
  pegaPartAccompaniment: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  pegaPartAccompanimentText: {
    fontSize: '30px',
    lineHeight: '40px',
    padding: '20px 20px',
    color: 'darkslategray'
  },
  pegaPartAccompanimentImage: {
    width: '700px',
    margin: '20px',
    borderRadius: '10px'
  },
  resolutionPart: {
    display: 'flex',
    flexDirection: 'row'
  },
  resolutionPartAccompanimentLeft: {
    width: '50%',
    alignItems: 'center'
  },
  resolutionPartAccompanimentRight: {
    width: '50%',
    alignItems: 'center',
    textAlign: 'center'
  },
  resolutionPartAccompanimentText: {
    fontSize: '28px',
    lineHeight: '40px',
    padding: '20px 20px',
    color: 'darkslategray'
  },
  resolutionButton: {
    color: 'white',
    backgroundColor: theme.palette.warning.main,
    fontSize: '25px',
    fontWeight: 'bold',
    borderRadius: '25px',
    border: '0px',
    margin: '20px',
    padding: '10px 30px'
  }
}));

export default function EmbeddedTopLevel() {
  const [mashupCaseTypes, setMashupCaseTypes] = useState([]);
  const [isPegaReady, setIsPegaReady] = useState<boolean>(false);
  const [accessGroup, setAccessGroup] = useState<string>('');
  // Array of 3 shopping options to display
  const shoppingOptions = [
    {
      play: 'Triple Play',
      level: 'Basic',
      channels: '100+',
      channels_full: '100+ (Basic +)',
      banner: 'Value package',
      price: '99.00',
      internetSpeed: '100 Mbps',
      calling: ''
    },
    {
      play: 'Triple Play',
      level: 'Silver',
      channels: '125+',
      channels_full: '125+ (Deluxe)',
      banner: 'Most popular',
      price: '120.00',
      internetSpeed: '300 Mbps',
      calling: ''
    },
    {
      play: 'Triple Play',
      level: 'Gold',
      channels: '175+',
      channels_full: '175+ (Premium)',
      banner: 'All the channels you want',
      price: '150.00',
      internetSpeed: '1 Gbps',
      calling: ' & International'
    }
  ];

  const classes = useStyles();

  // const [pConn, setPConn] = useState<any>(null);

  const [bShowTriplePlayOptions, setShowTriplePlayOptions] = useState(false);
  const [bShowPega, setShowPega] = useState(false);
  const [bShowResolutionScreen, setShowResolutionScreen] = useState(false);
  const [bShowAppName, setShowAppName] = useState(false);

  useEffect(() => {
    // Update visibility of UI when bShowTriplePlayOptions changes

    // eslint-disable-next-line no-console
    console.log(`EmbeddedTopLevel: bShowTriplePlayOptions set to ${bShowTriplePlayOptions}`);
    const theTopLevelEl = document.getElementById('embedded-top-level-banner-buttons');
    const theTopLevelRibbon = document.getElementById('embedded-top-level-ribbon');

    if (theTopLevelEl) {
      if (bShowTriplePlayOptions && sdkIsLoggedIn()) {
        // Only show when user is logged in and we're supposed to show it
        theTopLevelEl.style.display = 'block';
        if (theTopLevelRibbon) {
          theTopLevelRibbon.style.display = 'flex';
        }
      } else {
        theTopLevelEl.style.display = 'none';
        if (theTopLevelRibbon) {
          theTopLevelRibbon.style.display = 'none';
        }
      }
    }
  }, [bShowTriplePlayOptions]);

  useEffect(() => {
    // Update visibility of UI when bShowPega changes
    // eslint-disable-next-line no-console
    console.log(`EmbeddedTopLevel: bShowPega set to ${bShowPega}`);

    const thePegaPartEl = document.getElementById('pega-part-of-page');
    const theTopLevelRibbon = document.getElementById('embedded-top-level-ribbon');

    if (thePegaPartEl) {
      if (bShowPega) {
        thePegaPartEl.style.display = 'flex';
        if (theTopLevelRibbon) {
          theTopLevelRibbon.style.display = 'flex';
        }
      } else {
        thePegaPartEl.style.display = 'none';
      }
    }
  }, [bShowPega]);

  useEffect(() => {
    // Update visibility of UI when bShowResolutionScreen changes
    // eslint-disable-next-line no-console
    console.log(`EmbeddedTopLevel: bShowPega set to ${bShowPega}`);

    const theTopLevelEl = document.getElementById('embedded-top-level-resolution');
    const theTopLevelRibbon = document.getElementById('embedded-top-level-ribbon');

    if (bShowResolutionScreen && sdkIsLoggedIn()) {
      // Only show when user is logged in and we're supposed to show it
      if (theTopLevelEl) {
        theTopLevelEl.style.display = 'block';
      }
      if (theTopLevelRibbon) {
        theTopLevelRibbon.style.display = 'flex';
      }
    } else {
      if (theTopLevelEl) {
        theTopLevelEl.style.display = 'none';
      }
      if (theTopLevelRibbon) {
        theTopLevelRibbon.style.display = 'none';
      }
    }
  }, [bShowResolutionScreen]);

  useEffect(() => {
    // Update when bShowAppName changes
    // If not logged in, we used to prompt for login. Now moved up to TopLevelApp
    // If logged in, make the Triple Play Options visible

    if (!sdkIsLoggedIn()) {
      // login();     // Login now handled at TopLevelApp
    } else {
      setShowTriplePlayOptions(true);
    }
  }, [bShowAppName]);

  //  const outlet = document.getElementById("outlet");

  function assignmentFinished() {
    setShowTriplePlayOptions(false);
    setShowPega(false);
    setShowResolutionScreen(true);
  }

  function cancelAssignment() {
    setShowTriplePlayOptions(true);
    setShowPega(false);
    setShowResolutionScreen(false);
  }

  function establishPCoreSubscriptions() {
    PCore.getPubSubUtils().subscribe(
      'assignmentFinished',
      () => {
        assignmentFinished();
      },
      'assignmentFinished'
    );

    PCore.getPubSubUtils().subscribe(
      PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL,
      () => {
        cancelAssignment();
      },
      'cancelAssignment'
    );
  }

  // from react_root.js with some modifications
  // eslint-disable-next-line react/no-unstable-nested-components
  function RootComponent(props) {
    const PegaConnectObj = createPConnectComponent();

    // remove from Provider to work around compiler error for now: context={StoreContext}
    // return (
    //   <Provider store={PCore.getStore()} context={StoreContext} >
    //     <PegaConnectObj {...props} />
    //   </Provider>
    // );

    // const thePConnObj = <div>the RootComponent</div>;
    const thePConnObj = <PegaConnectObj {...props} />;

    // NOTE: For Embedded mode, we add in displayOnlyFA to our React context
    //  so it is available to any component that may need it.
    // VRS: Attempted to remove displayOnlyFA but it presently handles various components which
    //  SDK does not yet support, so all those need to be fixed up before it can be removed. To
    //  be done in a future sprint.
    return (
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      <StoreContext.Provider value={{ store: PCore.getStore(), displayOnlyFA: true }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {thePConnObj}
        </ThemeProvider>
      </StoreContext.Provider>
    );
  }

  /**
   * Callback from onPCoreReady that's called once the top-level render object
   * is ready to be rendered
   * @param inRenderObj the initial, top-level PConnect object to render
   */
  function initialRender(inRenderObj) {
    // loadMashup does its own thing so we don't need to do much/anything here

    // // modified from react_root.js render
    const { props, domContainerID = null, componentName, portalTarget, styleSheetTarget } = inRenderObj;

    const thePConn = props.getPConnect();
    // setPConn(thePConn);
    // eslint-disable-next-line no-console
    console.log(`EmbeddedTopLevel: initialRender got a PConnect with ${thePConn.getComponentName()}`);

    let target: any = null;

    if (domContainerID !== null) {
      target = document.getElementById(domContainerID);
    } else if (portalTarget !== null) {
      target = portalTarget;
    }

    console.log(
      `EmbeddedTopLevel: initialRender with domContainerID: ${domContainerID}, componentName: ${componentName}, portalTarget: ${portalTarget}, styleSheetTarget: ${styleSheetTarget}`
    );

    // Note: RootComponent is just a function (declared below)
    const Component: any = RootComponent;

    if (componentName) {
      Component.displayName = componentName;
    }

    const theComponent = (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...props} portalTarget={portalTarget} styleSheetTarget={styleSheetTarget} />
      </ThemeProvider>
    );

    // Initial render of component passed in (which should be a RootContainer)
    render(<>{theComponent}</>, target);
    setIsPegaReady(true);
    // Initial render to show that we have a PConnect and can render in the target location
    // render( <div>EmbeddedTopLevel initialRender in {domContainerID} with PConn of {componentName}</div>, target);
  }

  /**
   * kick off the application's portal that we're trying to serve up
   */
  function startMashup() {
    // NOTE: When loadMashup is complete, this will be called.
    PCore.onPCoreReady(renderObj => {
      // eslint-disable-next-line no-console
      console.log(`PCore ready!`);
      // Check that we're seeing the PCore version we expect
      compareSdkPCoreVersions();

      establishPCoreSubscriptions();
      setShowAppName(true);

      // Initialize the SdkComponentMap (local and pega-provided)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getSdkComponentMap(localSdkComponentMap).then((theComponentMap: any) => {
        // eslint-disable-next-line no-console
        console.log(`SdkComponentMap initialized`);

        // Don't call initialRender until SdkComponentMap is fully initialized
        initialRender(renderObj);
      });
    });

    // load the Mashup and handle the onPCoreEntry response that establishes the
    //  top level Pega root element (likely a RootContainer)

    myLoadMashup('pega-root', false); // this is defined in bootstrap shell that's been loaded already
  }

  // One time (initialization) subscriptions and related unsubscribe
  useEffect(() => {
    getSdkConfig().then((sdkConfig: any) => {
      const sdkConfigAuth = sdkConfig.authConfig;

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'Basic') {
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (!sdkConfigAuth.mashupClientId && sdkConfigAuth.customAuthType === 'BasicTO') {
        const now = new Date();
        const expTime = new Date(now.getTime() + 5 * 60 * 1000);
        let sISOTime = `${expTime.toISOString().split('.')[0]}Z`;
        const regex = /[-:]/g;
        sISOTime = sISOTime.replace(regex, '');
        // Service package to use custom auth with Basic
        const sB64 = window.btoa(`${sdkConfigAuth.mashupUserIdentifier}:${window.atob(sdkConfigAuth.mashupPassword)}:${sISOTime}`);
        sdkSetAuthHeader(`Basic ${sB64}`);
      }

      if (sdkConfigAuth.customAuthType === 'CustomIdentifier') {
        // Use custom bearer with specific custom parameter to set the desired operator via
        //  a userIdentifier property.  (Caution: highly insecure...being used for simple demonstration)
        sdkSetCustomTokenParamsCB(() => {
          return { userIdentifier: sdkConfigAuth.mashupUserIdentifier };
        });
      }

      document.addEventListener('SdkConstellationReady', () => {
        // start the portal
        startMashup();
      });

      // Login if needed, without doing an initial main window redirect
      loginIfNecessary({ appName: 'embedded', mainRedirect: false });
    });

    // Subscriptions can't be done until onPCoreReady.
    //  So we subscribe there. But unsubscribe when this
    //  component is unmounted (in function returned from this effect)

    return function cleanupSubscriptions() {
      PCore?.getPubSubUtils().unsubscribe(PCore.getConstants().PUB_SUB_EVENTS.EVENT_CANCEL, 'cancelAssignment');

      PCore?.getPubSubUtils().unsubscribe('assignmentFinished', 'assignmentFinished');
    };
  }, []);

  function onShopNow(optionClicked: string) {
    const sLevel = optionClicked;

    setShowTriplePlayOptions(false);
    setShowPega(true);

    getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields:
          mashupCaseType === 'DIXL-MediaCo-Work-NewService'
            ? {
                Package: sLevel
              }
            : {}
      };
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
        // eslint-disable-next-line no-console
        console.log('createCase rendering is complete');
      });
    });
  }

  function getShowTriplePlayOptionsMarkup() {
    // return "Show Triple Play Options here!";
    const theBanner = (
      <div className={classes.embedMainScreen}>
        <div className={classes.embedBanner}>
          <Typography variant='h5'>Combine TV, Internet, and Voice for the best deal</Typography>
        </div>
      </div>
    );

    const theOptions = shoppingOptions.map((option, index) => {
      return (
        <EmbeddedSwatch key={shoppingOptions[index].level} pcore={bShowAppName ? PCore : null} {...shoppingOptions[index]} onClick={onShopNow} />
      );
    });

    return (
      <>
        {theBanner}
        <div className={classes.embedShoppingOptions}>{theOptions}</div>
      </>
    );
  }

  function getResolutionScreenMarkup() {
    return (
      <div className={classes.resolutionPart}>
        <div className={classes.resolutionPartAccompanimentLeft}>
          <div className={classes.resolutionPartAccompanimentText}>
            <b>Welcome!</b>
            <br />
            <br />
            Thanks for selecting a package with us. <br />
            <br />
            A technician will contact you with in the next couple of days to schedule an installation.
            <br />
            <br />
            If you have any questions, you can contact us directly at <b>1-800-555-1234</b> or you can chat with us.
          </div>
        </div>
        <div className={classes.resolutionPartAccompanimentRight}>
          <img src='assets/img/cablechat.jpg' className={classes.pegaPartAccompanimentImage} />
          <br />
          <button className={classes.resolutionButton}>Chat Now</button>
        </div>
      </div>
    );
  }
  function handleClick() {
    getSdkConfig().then(sdkConfig => {
      const mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;

        setMashupCaseTypes(caseTypes);
      }
    });
  }

  useEffect(() => {
    if (isPegaReady) {
      setAccessGroup(PCore.getEnvironmentInfo().getAccessGroup());

      const dataViewName = 'D_ObjectList';
      const parameters = {
        Prop1: 'a'
      };
      const paging = {
        pageNumber: 1,
        pageSize: 10
      };
      const query = {
        distinctResultsOnly: true,
        select: [
          {
            field: 'Prop1'
          },
          {
            field: 'Prop2'
          }
        ]
      };

      (PCore.getDataPageUtils().getDataAsync(dataViewName, 'root', parameters, paging, query) as Promise<any>)
        .then(response => {
          console.log(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, [isPegaReady]);

  function handleCreateCase() {
    setShowPega(true);
    getSdkConfig().then(sdkConfig => {
      let mashupCaseType = sdkConfig.serverConfig.appMashupCaseType;
      if (!mashupCaseType) {
        const caseTypes = PCore.getEnvironmentInfo().environmentInfoObject.pyCaseTypeList;
        mashupCaseType = caseTypes[0].pyWorkTypeImplementationClassName;
      }

      const options: any = {
        pageName: 'pyEmbedAssignment',
        startingFields: {}
      };
      (PCore.getMashupApi().createCase(mashupCaseType, PCore.getConstants().APP.APP, options) as any).then(() => {
        // eslint-disable-next-line no-console
        console.log('createCase rendering is complete');
      });
    });
  }

  return (
    <div className='min-h-screen bg-white text-black'>
      <Header />
      <main>
        <section className='text-center py-24'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold'>We will make your life sweet!</h2>
            <p className='text-lg text-gray-700 mt-4 mb-8'>Sweet Life company is committed to bring joy and happiness into your life.</p>
            <div className='flex justify-center space-x-4'>
              <Button className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>Get started</Button>
              <Button className='bg-transparent text-[#bd1e59] px-6 py-2 rounded-md border border-[#bd1e59] hover:bg-[#bd1e59] hover:text-white'>
                Learn more
              </Button>
            </div>
            <img src='assets/img/cupcake.svg' className='w-32 h-32' />
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 text-center'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 sm:text-3xl md:text-4xl dark:bg-gray-800'>What we do</div>
              <h2 className='lg:leading-tighter mb-8 text-2xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                Our offer includes various types of chocolates, candy bars, cookies, jellies.
              </h2>
            </div>
            <div className='grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/cookie.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Delicious Homemade Cookies
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our cookies are baked fresh daily using the finest ingredients. Enjoy the perfect balance of sweetness and crunch in every bite.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/icecream.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Handcrafted Ice Creams
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our ice creams are made with the freshest ingredients and churned to perfection. Indulge in a variety of classic and unique flavors.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  {' '}
                  <img src='assets/img/lollipop.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Artisanal Lollipops
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our lollipops are handcrafted with care, using only the finest ingredients. Enjoy a variety of unique and delightful flavors.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10'>
            <div className='space-y-3'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-2xl md:text-3xl'>What our customers have to say</h2>
              <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Hear from the people who love using our product.
              </p>
            </div>
            <Carousel className='w-full max-w-3xl'>
              <CarouselContent>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “The customer service I received was exceptional. The support team went above and beyond to address my concerns.“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Jules Winnfield</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>CEO, Acme Inc</div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “I was hesitant at first, but after using the product, I was blown away by how easy it was to set up and use. Highly
                      recommended!“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Mia Wallace</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>Marketing Manager, Big Corp</div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “This product has completely transformed the way our team collaborates. The built-in tools make our workflow so much more
                      efficient.“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Vincent Vega</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>CTO, Acme Inc</div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
        <footer className='bg-gray-900 text-gray-300 py-12 md:py-16'>
          <div className='container px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold'>Get in Touch</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#'>Contact Us</a>
                </li>
                <li>
                  <a href='#'>Careers</a>
                </li>
                <li>
                  <a href='#'>Feedback</a>
                </li>
              </ul>
            </div>
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold'>Don't miss new products!</h4>
              <p className='text-sm'>Subscribe to our newsletter to stay up-to-date on the latest releases.</p>
              <form className='flex items-center space-x-2'>
                <input
                  className='bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-primary focus:ring-primary'
                  placeholder='Enter your email'
                  type='email'
                />
                <Button size='sm' variant='default'>
                  Subscribe
                </Button>
              </form>
            </div>
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold'>Our Guidelines</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#'>Shipping & Returns</a>
                </li>
                <li>
                  <a href='#'>Refund Policy</a>
                </li>
                <li>
                  <a href='#'>FAQs</a>
                </li>
              </ul>
            </div>
            <div className='space-y-4'>
              <h4 className='text-lg font-semibold'>Legal</h4>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a href='#'>Terms of Service</a>
                </li>
                <li>
                  <a href='#'>Privacy Policy</a>
                </li>
                <li>
                  <a href='#'>Cookie Policy</a>
                </li>
              </ul>
            </div>
          </div>
          <div className='container px-4 md:px-6 mt-8 md:mt-12 flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0'>
            <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
              <MailboxIcon className='w-5 h-5 mr-2' />
              <a className='text-sm' href='#'>
                contact@sweetlife.com
              </a>
            </div>
            <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
              <PhoneIcon className='w-5 h-5 mr-2' />
              <a className='text-sm' href='#'>
                903-179-8309
              </a>
            </div>
            <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
              <LocateIcon className='w-5 h-5 mr-2' />
              <span className='text-sm'>511 Schiller brucke, Boston</span>
            </div>
          </div>
        </footer>
        <div>
          {/* <h4>React SDK: /embedded</h4> */}
          <div className='bg-cyan-700' id='embedded-top-level-ribbon'>
            {bShowAppName ? <Typography variant='h4'>{PCore.getEnvironmentInfo().getApplicationLabel()}</Typography> : null}
            &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <div id='embedded-top-level-banner-buttons'>{bShowTriplePlayOptions ? getShowTriplePlayOptionsMarkup() : null}</div>
          <div id='embedded-top-level-resolution'>{bShowResolutionScreen ? getResolutionScreenMarkup() : null}</div>
          {/* The next div is the container for the Pega work and a corresponding image */}
          <div>
            <div className={classes.pegaPartInfo} id='pega-part-of-page'>
              <div className={classes.pegaPartPega}>
                <div id='pega-root' />
                <br />
                <div className={classes.pegaPartText}> * - required fields</div>
              </div>
              <div className={classes.pegaPartAccompaniment}>
                <div className={classes.pegaPartAccompanimentText}>We need to gather a little information about you.</div>
                <div>
                  <img src='assets/img/cableinfo.jpg' className={classes.pegaPartAccompanimentImage} />
                </div>
              </div>
            </div>
          </div>
          {isPegaReady ? <div>Pega is ready</div> : <div>Pega is not ready</div>}
          <div className='flex flex-col px-2 max-w-sm'>
            <Button variant='default' onClick={handleClick}>
              Get Mashup Case Types
            </Button>
            <ul>
              {mashupCaseTypes.map((caseType: any, index) => (
                <li key={index}>{caseType.pyWorkTypeName}</li>
              ))}
            </ul>
            <div>Access Group: {accessGroup}</div>
            <Button variant='default' onClick={handleCreateCase}>
              Create case
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function LollipopIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='11' cy='11' r='8' />
      <path d='m21 21-4.3-4.3' />
      <path d='M11 11a2 2 0 0 0 4 0 4 4 0 0 0-8 0 6 6 0 0 0 12 0' />
    </svg>
  );
}

function CakeIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8' />
      <path d='M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1' />
      <path d='M2 21h20' />
      <path d='M7 8v2' />
      <path d='M12 8v2' />
      <path d='M17 8v2' />
      <path d='M7 4h.01' />
      <path d='M12 4h.01' />
      <path d='M17 4h.01' />
    </svg>
  );
}

function CookieIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5' />
      <path d='M8.5 8.5v.01' />
      <path d='M16 15.5v.01' />
      <path d='M12 12v.01' />
      <path d='M11 17v.01' />
      <path d='M7 14v.01' />
    </svg>
  );
}

function IceCreamIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11' />
      <path d='M17 7A5 5 0 0 0 7 7' />
      <path d='M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4' />
    </svg>
  );
}

function LocateIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <line x1='2' x2='5' y1='12' y2='12' />
      <line x1='19' x2='22' y1='12' y2='12' />
      <line x1='12' x2='12' y1='2' y2='5' />
      <line x1='12' x2='12' y1='19' y2='22' />
      <circle cx='12' cy='12' r='7' />
    </svg>
  );
}

function MailboxIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z' />
      <polyline points='15,9 18,9 18,11' />
      <path d='M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0' />
      <line x1='6' x2='7' y1='10' y2='10' />
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  );
}
