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

export class Uris {
  public baseuri: string;
  public autonomicsbaseuri: string;
}

export class News2guidance {
  public topConcernsText: string;
  public score0_frequency: string;
  public score0_clinicalresponse: string;
  public score0_text: string;
  public score0_cssclass: string;


  public score1to4_frequency: string;
  public score1to4_clinicalresponse: string;
  public score1to4_text: string;
  public score1to4_cssclass: string;


  public score3single_frequency: string;
  public score3single_clinicalresponse: string;
  public score3single_text: string;
  public score3single_cssclass: string;


  public score5to6_frequency: string;
  public score5to6_clinicalresponse: string;
  public score5to6_text: string;
  public score5to6_cssclass: string;


  public score7ormore_frequency: string;
  public score7ormore_clinicalresponse: string;
  public score7ormore_text: string;
  public score7ormore_cssclass: string;


}

export class PEWSguidance {
  public topConcernsText: string;

  public score0_text: string;
  public score0_frequency: string;
  public score0_clinicalresponse: string;
  public score0_cssclass: string;

  public score1_text: string;
  public score1_frequency: string;
  public score1_clinicalresponse: string;
  public score1_cssclass: string;

  public score2_text: string;

  public score2_frequency: string;
  public score2_clinicalresponse: string;
  public score2_cssclass: string;

  public score3_text: string;
  public score3_frequency: string;
  public score3_clinicalresponse: string;
  public score3_cssclass: string;

  public score4_text: string;
  public score4_frequency: string;
  public score4_clinicalresponse: string;
  public score4_cssclass: string;

  public score5_text: string;
  public score5_frequency: string;
  public score5_clinicalresponse: string;
  public score5_cssclass: string;

  public score6_text: string;
  public score6_frequency: string;
  public score6_clinicalresponse: string;
  public score6_cssclass: string;

  public score7_text: string;
  public score7_frequency: string;
  public score7_clinicalresponse: string;
  public score7_cssclass: string;


}

export class MEWSguidance {
  public topConcernsText: string;

  public guidanceLOW_text: string;
  public guidanceLOW_primaryescalationresponse: string;
  public guidanceLOW_medicalreviewtimings: string;
  public guidanceLOW_minimalobservations: string;
  public guidanceLOW_secondarycontact: string;
  public guidanceLOW_additionalconcern: string;
  public guidanceLOW_cssclass: string;

  public guidanceLOWMEDIUM_text: string;
  public guidanceLOWMEDIUM_primaryescalationresponse: string;
  public guidanceLOWMEDIUM_medicalreviewtimings: string;
  public guidanceLOWMEDIUM_minimalobservations: string;
  public guidanceLOWMEDIUM_secondarycontact: string;
  public guidanceLOWMEDIUM_additionalconcern: string;
  public guidanceLOWMEDIUM_cssclass: string;

  public guidanceMEDIUM_text: string;
  public guidanceMEDIUM_primaryescalationresponse: string;
  public guidanceMEDIUM_medicalreviewtimings: string;
  public guidanceMEDIUM_minimalobservations: string;
  public guidanceMEDIUM_secondarycontact: string;
  public guidanceMEDIUM_additionalconcern: string;
  public guidanceMEDIUM_cssclass: string;

  public guidanceHIGH_text: string;
  public guidanceHIGH_primaryescalationresponse: string;
  public guidanceHIGH_medicalreviewtimings: string;
  public guidanceHIGH_minimalobservations: string;
  public guidanceHIGH_secondarycontact: string;
  public guidanceHIGH_additionalconcern: string;
  public guidanceHIGH_cssclass: string;

}

export class MARSIguidance {
  public topConcernsText: string;

  public guidanceNORISK_score: string;
  public guidanceNORISK_text: string;
  public guidanceNORISK_primaryescalationresponse: string;
  public guidanceNORISK_medicalreviewtimings: string;
  public guidanceNORISK_minimalobservations: string;
  public guidanceNORISK_cssclass: string;

  public guidanceLOW_score: string;
  public guidanceLOW_text: string;
  public guidanceLOW_primaryescalationresponse: string;
  public guidanceLOW_medicalreviewtimings: string;
  public guidanceLOW_minimalobservations: string;
  public guidanceLOW_cssclass: string;

  public guidanceMEDIUM_score: string;
  public guidanceMEDIUM_text: string;
  public guidanceMEDIUM_primaryescalationresponse: string;
  public guidanceMEDIUM_medicalreviewtimings: string;
  public guidanceMEDIUM_minimalobservations: string;
  public guidanceMEDIUM_cssclass: string;

  public guidanceMEDIUMHIGH_score: string;
  public guidanceMEDIUMHIGH_text: string;
  public guidanceMEDIUMHIGH_primaryescalationresponse: string;
  public guidanceMEDIUMHIGH_medicalreviewtimings: string;
  public guidanceMEDIUMHIGH_minimalobservations: string;
  public guidanceMEDIUMHIGH_cssclass: string;

  public guidanceHIGH_score: string;
  public guidanceHIGH_text: string;
  public guidanceHIGH_primaryescalationresponse: string;
  public guidanceHIGH_medicalreviewtimings: string;
  public guidanceHIGH_minimalobservations: string;
  public guidanceHIGH_cssclass: string;

}
export class SBAR{
  public showDoesThePatientLookSick:boolean;
  public showConcernsAboutThisPatient:boolean;
  public monitoringFrequencyValues:any;
  public defaultMonitoringFrequency:any;

}

export class Appsettings {
  public news2guidance: News2guidance = new News2guidance();
  public pewsguidance: PEWSguidance = new PEWSguidance();
  public MEWSguidance: MEWSguidance = new MEWSguidance();
  public marsiguidance: MARSIguidance = new MARSIguidance();
  public SBAR: SBAR = new SBAR();
  public obsFormFields:any;
  public pewsAgeThreshold:number;
  public hideAddObsForPews:boolean
  public bp_nottaken_warning_message: string;
  public bpwarningthresholdminutes: number;
  public max_consecutive_partial_sets: number;
  public partial_notallowed_after_mins: number;
  public painscale_warning_threshold_score: number;
  public obs_due_warning: string;
  public other_concerns_about_patient_warning_message: string;
  public could_be_infection_warning_message: string;
  public obs_added_notification_msg: string;
  public can_send_notification: boolean;
  public can_receive_notification: boolean;
  public useNews2MonFreq: boolean;
  public openGuidModalOnClickFromChart: boolean;
  public SBARGuidance:any;
  public ObservationTimeRetrospectiveLimit:number;
}

export class configmodel {
  constructor(
    public uris?: Uris,
    public enablelogging?: boolean,
    public appsettings: Appsettings = new Appsettings(),
    public prodbuild?: boolean,
    public environment?:string,
    public locationNames?:any,
    public pewsAgeThreshold?:any
  ) { };
}


