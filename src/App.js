import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import {useSelector} from "react-redux";
import Navigation from './components/Navigation/Navigation';
import MyActivitiesPage from "./containers/MyActivitiesPage";
import HomePage from "./containers/HomePage";
import MapPage from "./containers/MapPage";
import FamilyActivitiesPage from "./containers/FamilyActivitiesPage";
import MyActivityEventsPage from "./containers/MyActivityEventsPage";
import MyHealthEventPage from "./containers/MyHealthEventPage";
import InformingPage from "./containers/InformingPage";

// FIXME merge these two files to a sass file please
import './App.css';
import './_App.scss';


export default function App() {

    const showNavBar = useSelector(state => state.Commons.showNavigation);

    return (
        <div className="app-container">
            <div className="app-content">
                <div>
                    {/**
                     * A <Switch> looks through its children <Route>s and
                     * renders the first one that matches the current URL.
                     */}
                    <Switch>
                        <Route path="/" exact>
                            <Redirect to="/home" />
                        </Route>
                        <Route path="/home" exact>
                            <HomePage />
                        </Route>
                        <Route path="/map" exact>
                            <MapPage />
                        </Route>
                        <Route path="/my-activities" exact>
                            <MyActivitiesPage />
                        </Route>
                        <Route path="/family-activities" exact>
                            <FamilyActivitiesPage />
                        </Route>
                        <Route path="/informing" exact>
                            <InformingPage />
                        </Route>
                        <Route path="/add-myactivities" exact>
                            <MyActivityEventsPage/>
                        </Route>
                        <Route path="/my-health-event" exact>
                            <MyHealthEventPage/>
                        </Route>
                    </Switch>
                </div>
            </div>
            {showNavBar &&
                <div className="app-navigation">
                    <Navigation/>
                </div>
            }
        </div>
    );
}

