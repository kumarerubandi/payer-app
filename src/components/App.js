import React, { Component } from 'react';
import {Switch} from 'react-router';
import {BrowserRouter, Redirect, Route} from 'react-router-dom';
//import PrivateRoute from './privateRoute';
//import RequestBuilder from '../containers/RequestBuilder';
// import CoverageDetermination from '../containers/CoverageDetermination';
//import PriorAuthorization from '../containers/PriorAuthorization';
// import ProviderRequest from '../containers/ProviderRequest';
import CommunicationHandler from '../containers/CommunicationHandler';
import CommunicationRequest from '../containers/CommunicationRequest';
//import Review from '../containers/Review';
import LoginPage from '../containers/loginPage';
// import Launch from '../containers/Launch';
// import Main from '../containers/Main';
import Configuration from '../containers/configuration';
import { library } from '@fortawesome/fontawesome-svg-core'
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIgloo,faNotesMedical } from '@fortawesome/free-solid-svg-icons';

library.add(faIgloo,faNotesMedical)
export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" component={() => { return <Redirect to="/login" />}} />
                    <Route path={"/login"} component={LoginPage} />                    
                    <Route path={"/communications"} component={CommunicationHandler} />                
                    <Route path={"/request_for_documentation"} component={CommunicationRequest} />                    
                    <Route path={"/configuration"} component={Configuration} />

                </Switch>
            </BrowserRouter>
        );
    }
}