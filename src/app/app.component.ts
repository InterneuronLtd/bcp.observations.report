//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
/* Interneuron Observation App
Copyright(C) 2023  Interneuron Holdings Ltd
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the
GNU General Public License for more details.
You should have received a copy of the GNU General Public License
along with this program.If not, see<http://www.gnu.org/licenses/>. */

import { Component, ViewChild, ElementRef, OnDestroy, Input, Output, EventEmitter, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { SubjectsService } from './services/subjects.service';
import { AppService } from './services/app.service';
import { Subscription, Subject } from 'rxjs';
import { ApirequestService } from './services/apirequest.service';
import { filters, filterParams, filterparam, filter, selectstatement, orderbystatement, action } from './models/Filter.model';
import * as moment from 'moment';
import { ComponentModuleData } from './directives/module-loader.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {


  showChart = false;
  hasEncounters = false;
  showNoEncounterMsg = false;
  showSepsisModule = false;
  componentModuleData: ComponentModuleData;
  encountersListLoaded(value: boolean) {
    this.hasEncounters = value;
    this.showNoEncounterMsg = !value;
    this.subjects.initialzeFormMetaData.next(true);
  }

  title = 'terminus-module-observation-chart';
  alerts: any[] = [];
  observationsFormHeader = "Add Observations";
  @ViewChild('closObsForm') closeObsFormButton: ElementRef;
  @ViewChild('openObsForm') openObsFormButton: ElementRef;

  subscriptions: Subscription = new Subscription();
  obsLoaded = false;
  isCurrentEncounter = false;
  obsDueTime: number;
  obsDueMessage: string;


  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService,public cd:ChangeDetectorRef) {

  }


  generateChart() {
    this.appService.reset();
    this.showChart = false;
    this.cd.detectChanges();
    this.showChart= true;
    this.cd.detectChanges();
    this.InitApp()
  }


  InitApp() {

    let encounter;
    let input = <HTMLInputElement>document.getElementById("encounter_input");
    if (input)
      encounter = JSON.parse(input.value)


    this.appService.encounter_id = encounter.encounter_id;
    this.appService.personId = encounter.person_id;
    this.appService.encounter = encounter;
    this.appService.lenghOfStay = this.appService.GetDurationBetweenDates(this.appService.encounter.admitdatetime, moment())
    this.appService.personDOB = encounter.dateofbirth;
    // this.appService.personId = "ec321b71-d008-4eba-ae38-d12bad2ee12e";// "17775da9-8e71-4a3f-9042-4cdcbf97efec";// "429904ca-19c1-4a3a-b453-617c7db513a3";//"027c3400-24cd-45c1-9e3d-0f4475336394";//"429904ca-19c1-4a3a-b453-617c7db513a3";
    // this.appService.encounter_id = "02037d40-6206-4a9d-ba75-c7ec5c91346b";
    let value: any = {};
    value.authService = {};
    value.authService.user = {};
    let auth = this.apiRequest.authService;
    auth.getToken().then((token) => {
      value.authService.user.access_token = token;
      this.initConfig(value);
    });

  }


  initConfig(value: any) {
    this.appService.apiService = value;
  
    this.subscriptions.add(this.apiRequest.getRequest("./assets/config/ObsChartConfig.json?V" + Math.random()).subscribe(
      (response) => {
        this.appService.appConfig = response;
        this.appService.baseURI = this.appService.appConfig.uris.baseuri;
        this.appService.autonomicsBaseURI = this.appService.appConfig.uris.autonomicsbaseuri;
        this.appService.enableLogging = this.appService.appConfig.enablelogging;
        this.appService.pewsAgeThreshold =  this.appService.appConfig.pewsAgeThreshold
        this.appService.setPatientAgeAtAdmission();

        //get locationname by id 
      let location =  this.appService.appConfig.locationNames.find(x=>x.locationid == this.appService.encounter.currentlocation);
        if(location)
          this.appService.encounter.currentlocation = location.locationname;


         //get obs Scale 
     this.subscriptions.add(this.apiRequest.getRequest(this.appService.baseURI + "/GetList?synapsenamespace=meta&synapseentityname=observationscaletype").subscribe(
      (response) => {
        let responseArray = JSON.parse(response);
        for (let r of responseArray) {
          this.appService.obsScales.push(r);
        }

        //get person scale type
        this.subscriptions.add(this.apiRequest.getRequest(this.appService.baseURI + "/GetListByAttribute?synapsenamespace=core&synapseentityname=personobservationscale&synapseattributename=person_id&attributevalue=" + this.appService.personId)
          .subscribe(
            (personobservationscale) => {
              let personobservationscalelist = JSON.parse(personobservationscale);
              if (personobservationscalelist.length > 0) {
                this.appService.personscale = personobservationscalelist[0];
              }
              this.appService.setCurrentScale();
            
             this.getLatestMonitoring(()=>{
              this.getHeightWeight(()=>{
                this.subjects.drawGraph.next(true);
                this.appService.isInitComplete = true;
              });
             });
            }
          ));
      }));
      }));
  }


  ngOnDestroy() {
    this.appService.logToConsole("app component being unloaded");
    this.appService.encounter = null;
    this.appService.personId = null;
    this.appService.personscale = null;
    this.appService.isCurrentEncouner = null;
    this.appService.reset();
    this.subscriptions.unsubscribe();
    this.subjects.unload.next("app-element");
  }


  obsLoadComplete() {
    this.obsLoaded = true;
  }



  getHeightWeight(cb: () => any) {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + "/GetBaseViewListByPost/eobs_getlatestheightandweightobs", this.createFilterEncounter())
        .subscribe((response) => {
          if (response.length > 0) {

            let weight = response?.find(x => x.observationtype == "weight");
            let height = response?.find(x => x.observationtype == "height");

            if (weight && weight.value != "" && weight.value != null) {
            
              this.appService.weight = weight.value;
              //this.refWeightType = (weight.method ?? "").indexOf("258083009") >= 0 ? RefWeightType.estimated :
              //(weight.method ?? "").indexOf("115341008") >= 0 ? "actual" : null;
               this.appService.weightRecordedOn = moment(new Date(weight.datefinished)).format('DD-MMM-yyyy HH:mm');
            }
            if (height && height.value != "" && height.value != null) {
              this.appService.height = height.value;
              this.appService.heightRecordedOn = moment(new Date(height.datefinished)).format('DD-MMM-yyyy HH:mm');

            }
          }
          else {
            this.appService.weight = undefined;
            //this.refWeightType = null;
            this.appService.height = undefined;
            //this.refWeightType = null;
          }
          cb();
        }));
  }

  createFilterEncounter() {
    // let condition = "person_id = @person_id and encounter_id = @encounter_id";
    let condition = "encounter_id = @encounter_id";

    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("encounter_id", this.appService.encounter_id));
    // pm.filterparams.push(new filterparam("person_id", this.appService.encounter.person_id));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }


  

  getLatestMonitoring(cb: () => any) {

    //get the monitoring data for latest event
      if (this.appService.encounter) {
        this.subscriptions.add(this.apiRequest.postRequest(`${this.appService.baseURI}/GetBaseViewListByPost/eobs_latestmonitoringfrequencies`, this.createFilterEncounter())
          .subscribe((monitoring) => {
            if (monitoring) {
              let monitoringEvent = monitoring?.find(x => x.observationtype == "NEWS2Monitoring");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id && monitoringEvent.observationfrequency) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.NEWS2MonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`
                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }
              else {
                  this.appService.nextObsDueTime = new Date(moment(this.appService.encounter.admitdatetime, moment.ISO_8601).add(60, "minutes").toISOString()).toString();
                  this.appService.NEWS2MonitoringFrequency = "Not Set";
              }

              if(this.isNEWS2OverdueDue())
              this.appService.timetonextNEWS2 = this.appService.GetDurationBetweenDates(this.appService.nextObsDueTime, moment())
            else
            this.appService.timetonextNEWS2 = this.appService.GetDurationBetweenDates(moment(),this.appService.nextObsDueTime )


              if (monitoringEvent) {
                this.appService.isNEWS2MonitoringStopped = monitoringEvent.isstop;
              }

              //blood glucose
              monitoringEvent = null;
               monitoringEvent = monitoring?.find(x => x.observationtype == "BloodGlucose");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.BGMonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`

                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextBGObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }
             
              if(this.isBGOverdueDue())
                this.appService.timetonextBG = this.appService.GetDurationBetweenDates(this.appService.nextBGObsDueTime, moment())
              else
              this.appService.timetonextBG = this.appService.GetDurationBetweenDates(moment(),this.appService.nextBGObsDueTime )
  
              if (monitoringEvent) {
                this.appService.isBGMonitoringStopped = monitoringEvent.isstop;
              }

              //bristol stool
              monitoringEvent = null;
               monitoringEvent = monitoring?.find(x => x.observationtype == "BristolStoolChart");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.BSCMonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`

                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextBSCObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }
             
              if(this.isBSCOverdueDue())
                this.appService.timetonextBSC = this.appService.GetDurationBetweenDates(this.appService.nextBSCObsDueTime, moment())
              else
              this.appService.timetonextBSC = this.appService.GetDurationBetweenDates(moment(),this.appService.nextBSCObsDueTime )
  
              if (monitoringEvent) {
                this.appService.isBSCMonitoringStopped = monitoringEvent.isstop;
              }

              //Food & Fluid
              monitoringEvent = null;
               monitoringEvent = monitoring?.find(x => x.observationtype == "FoodAndFluid");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.FFMonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`

                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextFFObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }
             
              if(this.isFFOverdueDue())
                this.appService.timetonextFF = this.appService.GetDurationBetweenDates(this.appService.nextFFObsDueTime, moment())
              else
              this.appService.timetonextFF = this.appService.GetDurationBetweenDates(moment(),this.appService.nextFFObsDueTime )
  
              if (monitoringEvent) {
                this.appService.isFFMonitoringStopped = monitoringEvent.isstop;
              }

              //Glasgow Coma Scale
              monitoringEvent = null;
               monitoringEvent = monitoring?.find(x => x.observationtype == "GlasgowComaScale");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.GCSMonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`

                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextGCSObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }
             
              if(this.isGCSOverdueDue())
                this.appService.timetonextGCS = this.appService.GetDurationBetweenDates(this.appService.nextGCSObsDueTime, moment())
              else
              this.appService.timetonextGCS = this.appService.GetDurationBetweenDates(moment(),this.appService.nextGCSObsDueTime )
  
              if (monitoringEvent) {
                this.appService.isGCSMonitoringStopped = monitoringEvent.isstop;
              }

               //Measurements
              monitoringEvent = null;
              monitoringEvent = monitoring?.find(x => x.observationtype == "Measurements");
              if (monitoringEvent && this.appService.encounter.encounter_id == monitoringEvent.encounter_id) {
                //if there is no observation recorded, but a monitoring frequcy is available, apply it on admit date time 
                this.appService.MeasurementsMonitoringFrequency = `${monitoringEvent.frequency_entered} ${monitoringEvent.frequencyunit_entered}`

                let startdate = monitoringEvent.observationdatetime ? monitoringEvent.observationdatetime : this.appService.encounter.admitdatetime
                this.appService.nextMeasurementsObsDueTime = new Date(moment(startdate, moment.ISO_8601).add(Math.ceil(<number>monitoringEvent.observationfrequency * 60), "minutes").toISOString()).toString();
              }

              if (this.isMeasurementsOverdueDue())
                this.appService.timetonextMeasurements = this.appService.GetDurationBetweenDates(this.appService.nextMeasurementsObsDueTime, moment())
              else
                this.appService.timetonextMeasurements = this.appService.GetDurationBetweenDates(moment(), this.appService.nextMeasurementsObsDueTime)

              if (monitoringEvent) {
                this.appService.isMeasurementsMonitoringStopped = monitoringEvent.isstop;
              }

            }
            cb();
          },(error)=>{
           cb();
          }));
      }
  }

  isNEWS2OverdueDue() {

    if (this.appService.nextObsDueTime)
      if (moment(new Date(this.appService.nextObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  isBGOverdueDue() {

    if (this.appService.nextBGObsDueTime)
      if (moment(new Date(this.appService.nextBGObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  isBSCOverdueDue() {

    if (this.appService.nextBSCObsDueTime)
      if (moment(new Date(this.appService.nextBSCObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  isFFOverdueDue() {

    if (this.appService.nextFFObsDueTime)
      if (moment(new Date(this.appService.nextFFObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  isGCSOverdueDue() {

    if (this.appService.nextGCSObsDueTime)
      if (moment(new Date(this.appService.nextGCSObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

  isMeasurementsOverdueDue() {

    if (this.appService.nextMeasurementsObsDueTime)
      if (moment(new Date(this.appService.nextMeasurementsObsDueTime).toISOString()).isBefore()) {
        return true;
      }
      else {
        return false;
      }
  }

}
