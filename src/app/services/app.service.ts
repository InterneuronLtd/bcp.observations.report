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

import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Encounter } from '../models/encounter.model';
import { PersonObservationScale, Observationtype, Observationevent, Observationscaletype } from '../models/observations.model';
import { Subscription } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { action } from '../models/Filter.model';
import { configmodel } from '../models/config.model';
import * as moment from 'moment';
import { SubjectsService } from './subjects.service';



@Injectable({
  providedIn: 'root'
})
export class AppService {
  sepsisAssessmentURI: string;
  sepsisAssessmentElementTag: string;
  encounter_id: any;
  lenghOfStay: string;
  height: any;
  weight: any;
  wightRecordedOn: string;
  weightRecordedOn: string;
  heightRecordedOn: string;
  isNEWS2MonitoringStopped: any;
  nextBGObsDueTime: string;
  isBGMonitoringStopped: any;
  NEWS2MonitoringFrequency: string;
  BGMonitoringFrequency: string;
  nextBSCObsDueTime: string;
  isBSCMonitoringStopped: any;
  BSCMonitoringFrequency: string;
  nextFFObsDueTime: string;
  isFFMonitoringStopped: any;
  FFMonitoringFrequency: string;
  nextGCSObsDueTime: string;
  isGCSMonitoringStopped: any;
  GCSMonitoringFrequency: string;
  nextMeasurementsObsDueTime: string;
  isMeasurementsMonitoringStopped: any;
  MeasurementsMonitoringFrequency: string;
  timetonextNEWS2: string;
  timetonextBG: string;
  timetonextBSC: string;
  timetonextFF: string;
  timetonextGCS: string;
  timetonextMeasurements: string;
  reset
  (): void {
    this.isNEWS2MonitoringStopped=null;
    this.weightRecordedOn = null;
    this.heightRecordedOn = null;
    this.height = null;
    this.weight = null;
    this.lenghOfStay = null;
    this.personId = null;
    this.encounter = null;
    this.chartJson = null;
    this.chartDataJson = null;
    this.isCurrentEncouner = false;
    this.apiService = null;
    this.personscale = null;
    this.baseURI = null;
    this.autonomicsBaseURI = null;
    this.appConfig = new configmodel();
    this.loggedInUserName = null;
    this.enableLogging = true;
    this.roleActions = [];
    this.obsTypes = [];
    this.prevObservationEvents = null;
    this.currentEWSScale = null;
    this.obsScales = [];
    this.nextObsDueTime = null;
    this.isInitComplete = null;
    this.personDOB = null;
    this.personAgeAtAdmission = null;
    this.nextBGObsDueTime = null;
    this.isBGMonitoringStopped = null;
    this.NEWS2MonitoringFrequency = null;
    this.BGMonitoringFrequency = null;
    this.BSCMonitoringFrequency = null;
    this.nextBSCObsDueTime = null;
    this.isBSCMonitoringStopped = null;
    this.FFMonitoringFrequency = null;
    this.nextFFObsDueTime = null;
    this.isFFMonitoringStopped = null;
    this.GCSMonitoringFrequency = null;
    this.nextGCSObsDueTime = null;
    this.isGCSMonitoringStopped = null;
    this.MeasurementsMonitoringFrequency = null;
    this.nextMeasurementsObsDueTime = null;
    this.isMeasurementsMonitoringStopped = null;
this.timetonextNEWS2 = null;
this.timetonextBG = null;
this.timetonextBSC = null;
this.timetonextFF = null;
this.timetonextGCS = null;
this.timetonextMeasurements = null;
this.pewsAgeThreshold =null;
this.selectedChart=null;
this.openSelectedGuidance=null;
this.PersonCurrentAge=null;
  }
  subscriptions: Subscription;
  public personId: string;
  public encounter;
  public chartJson: JSON;
  public chartDataJson: JSON;
  public isCurrentEncouner: boolean = false;
  public apiService: any;
  personscale: PersonObservationScale = null;
  public baseURI: string;
  public autonomicsBaseURI: string;
  public appConfig: configmodel = new configmodel();
  public loggedInUserName: string = null;
  public enableLogging: boolean = true;
  public roleActions: action[] = [];
  public obsTypes: Observationtype[];
  public prevObservationEvents: Array<Observationevent> = null;
  public currentEWSScale: string;
  public obsScales: Array<Observationscaletype> = [];

  public nextObsDueTime: string;
  public isInitComplete: boolean;
  public personDOB: Date;
  public personAgeAtAdmission: number;
  public pewsAgeThreshold: any;
  public selectedChart: string;
  public openSelectedGuidance: string;
  public PersonCurrentAge: number;
  constructor(private subjects: SubjectsService) {
  }
  decodeAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    }
    catch (Error) {
      return null;
    }
  }

  logToConsole(msg: any) {
    if (this.enableLogging) {
      console.log(msg);
    }
  }

  setPatientAgeAtAdmission() {
    this.personAgeAtAdmission = moment(this.encounter.admitdatetime, moment.ISO_8601).diff(moment(this.personDOB, moment.ISO_8601), "years");
    this.PersonCurrentAge =  moment(new Date()).diff(moment(this.personDOB, moment.ISO_8601), "years");
  }

  setCurrentScale() {
    let scale = "";

    if (this.personscale) {
      const matchedScale = this.obsScales.find(x => x.observationscaletype_id === this.personscale.observationscaletype_id);
      scale = matchedScale?.scaletypename || "";

      if (this.personscale.encounter_id !== this.encounter.encounter_id && this.isCurrentEncouner) {
        scale = this.getScaleByAge(this.PersonCurrentAge);
        // this.saveScale(scale);
      }
    } else {

      scale = this.getScaleByAge(this.PersonCurrentAge);
      // this.saveScale(scale);
    }

    this.currentEWSScale = scale;

    // if (this.ISMentalHealthCareSetup()) {
    //   this.SetObservationTypeText();
    // }

    this.subjects.frameworkEvent.next("BADGEACTION_EWSCHARTTYPE_" + this.GetChartType())

    return scale;
  }

  GetChartType()
  {
    switch (this.currentEWSScale) {
      case "NEWS2-Scale1":
      case "NEWS2-Scale2":
        {
          return "NEWS2";
        }
      case "PEWS-0To11Mo":
      case "PEWS-1To4Yrs":
      case "PEWS-5To12Yrs":
      case "PEWS-13To18Yrs":
        {
          return "PEWS";
        }
      case "MEWS-Scale": return "MEWS";
      default:
        return "";
    }
  } 
  
  private getScaleByAge(age: number): string {
    if (age < this.appConfig.appsettings.pewsAgeThreshold) {
      if (age <= 0) return "PEWS-0To11Mo";
      if (age >= 1 && age <= 4) return "PEWS-1To4Yrs";
      if (age >= 5 && age <= 12) return "PEWS-5To12Yrs";
      if (age >= 13 && age <= 18) return "PEWS-13To18Yrs";
    }
    return "NEWS2-Scale1";
  }

  public isNewsScale(ewsScaleTyoe: string) {
    switch (ewsScaleTyoe) {
      case "NEWS2-Scale1":
      case "NEWS2-Scale2":
        {
          return true;
        }
      case "PEWS-0To11Mo":
      case "PEWS-1To4Yrs":
      case "PEWS-5To12Yrs":
      case "PEWS-13To18Yrs":
        {
          return false;
        }
      default:
        return null;
    }

  }

  GetDurationBetweenDates(from, to): string {
    const fromdate = moment(from);

    const enddate = moment(to);

    const duration = moment.duration(enddate.diff(fromdate));

    // Get the individual components (days, hours, minutes)
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    let finalstringarray = []
    if(days)
      finalstringarray.push(`${days} day(s),`);
    if(hours)
      finalstringarray.push(`${hours} hour(s),`);
    if(minutes)
      finalstringarray.push(`${minutes} minute(s)`)

    return finalstringarray.join(" ");
  }
}
