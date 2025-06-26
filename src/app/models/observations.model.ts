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
export class Observationevent {
  constructor(
    public observationevent_id: string,
    public person_id: string,
    public datestarted: any,
    public datefinished: any,
    public addedby: string,
    public encounter_id: string,
    public isamended: boolean,
    public observationfrequency: number,
    public observationscaletype_id: string,
    public escalationofcare: boolean,
    public reasonforamend: string,
    public _createdby: string,
    public reasonforincompleteobservations?: string,
    public reasonfordelete?: string,
    public eventcorrelationid?: string,
    public incomplete?: boolean,
    public patientrefused?: boolean,
    public reasonforpatientrefused?: string,
    public isnews2?: boolean,
    public observationtype_id?: string,
    public observationtypetext?: string,
    public isdeleted?: boolean,
    public deletedby?: string,
    public deletedreasonothertext?: string,
    public _additionalinfo?: string,
    public ispartial?: boolean,
    public _createddate?: any
  ) { }
}


export class Observation {
  constructor(
    public observation_id?: string,
    public units?: string,
    public symbol?: string,
    public timerecorded?: any,
    public observationevent_id?: string,
    public observationtype_id?: string,
    public observationtypemeasurement_id?: string,
    public value?: string,
    public hasbeenammended?: boolean,
    public _createdby?: string,
    public eventcorrelationid?: string
  ) { }
}

export class Observationtype {
  constructor(
    public observationtype_id: string,
    public code: string,
    public name: string,
    public active: boolean,
    public valuetype: string,
    public valuelist: string) { }
}

export class ObservationEventMonitoring {
  constructor(
    public observationeventmonitoring_id: string,
    public observationevent_id: string,
    public observationfrequency: number,
    public escalationofcare: boolean,
    public ispatientsick: string,
    public concernsaboutpatient: string,
    public couldbeinfection: string,
    public escalatedtowhom?: string,
    public reasonfornotescalating?: string,
    public monitoringcomments?: string,
    public eventcorrelationid?: string,
    public hasbeenammended?: boolean,
    public isobservationfrequencyamended?: boolean,
    public isescalationofcareamended?: boolean,
    public frequency_entered?: string,
    public frequencyunit_entered?: string,
    public frequency_reason?: string,
    public frequency_reason_other?: string,
    public ispause?: boolean,
    public isstop?: boolean,
    public isnewstwosuggestestedfreq?: boolean,
    public observationtype_id?: string,
    public observationtypetext?: string,
    public isdeleted?: boolean,
    public deletedby?: string,
    public deletedreasonothertext?: string,
    public monitoringnotrequired?: boolean,
    public _additionalinfo?: string
  ) { }

}

//mapping reactive form observation names to observation codes synapse, to add a new quesiton, add to reactive form and to this enum. 
export enum obsNames {
  ["oxygenDevice"] = "OXYGENDEV",
  ["inspiredOxygenPercentage"] = "INSPIREO2PERCENTAGE",
  ["inspiredOxygenLitrePerMin"] = "INSPIREO2LITREPERMIN",
  ["positionBP"] = "BPPOSITION",
  ["painScaleMovement"] = "PAINSCOREMOVEMENT",
  ["painScaleRest"] = "PAINSCOREATREST",
  ["supplementalOxygen"] = "ONOXYGEN",
  ["temperature"] = "TEMP",
  ["respirationRate"] = "RESP",
  ["oxygenSaturation"] = "SPO2",
  ["pulseRate"] = "HR",
  ["systolicBP"] = "SBP",
  ["diastolicBP"] = "DBP",
  ["consciousLevel"] = "CLVL",
  ["bowelsOpen"] = "BSC",
  ["height"] = "HEIGHT",
  ["weight"] = "WEIGHT",
  ["glucose"] = "glucose",
  ["respdistress"] = "respdistress",
  ["concern"] = "concern",
  ["concerns"] = "concerns",
  ["reasonfornobp"] = "reasonfornobp",
  ["laterality"] = "laterality",
  ["painScale"] = "PAINSCORE",

  //pews mappings with reactive form
  ["carerQuestionWSBAU"] = "pews_wsbau",
  ["carerSuggests"] = "pews_carersuggests",
  ["CRT"] = "pews_CRT",
  ["suspicionOfSepsisOrSepticShock"] = "pews_sepsissuspicion",
  ["suspicionOfNMS"] = "pews_NMSsuspicion",
  ["clinicalIntuition"] = "pews_clinicalintuition",
  ["nurseClinicianConcern"] = "pews_clinicalconcern",
  ["respirationDistress"] = "respdistress",
  ["SpO2"] = "SPO2",
  ["heartRate"] = "HR",
  ["AVPU"] = "CLVL",
  ["painScore"] = "PAINSCORE",
  ["respiratorySupportDevice"] = "pews_respdevice",
  ["oxygenFlowRate"] = "INSPIREO2LITREPERMIN",
  ["FiO2"] = "INSPIREO2PERCENTAGE",
  ["oxygenSupport"] = "pews_oxygensupport",
  ["respiratorySupport"] = "pews_respsupport",
  ["SpO2ProbeChange"] = "pews_spo2probechange"
}

// mapping chart observation names/identifiers to observaiton types in synapse
export enum obsNamesFromChart {
  ["device"] = "OXYGENDEV",
  ["isonoxygen"] = "ONOXYGEN",
  ["temperature"] = "TEMP",
  ["respirations"] = "RESP",
  ["oxygensaturations"] = "SPO2",
  ["pulse"] = "HR",
  ["systolicbloodpressure"] = "SBP",
  ["diastolicbloodpressure"] = "DBP",
  ["consciousness"] = "CLVL",
  ["bowelsopen"] = "BSC",
  ["glucose"] = "glucose",
  ["painscoreatrest"] = "PAINSCOREATREST",
  ["painscorewithmovement"] = "PAINSCOREMOVEMENT",
  ["inspireoxygenpercentage"] = "INSPIREO2PERCENTAGE",
  ["inspireoxygenlitrepermin"] = "INSPIREO2LITREPERMIN",
  ["monitoring"] = "monitoring",
  ["escalationofcare"] = "escalationofcare",
  ["respiratorydistress"] = "respdistress",
  ["dfnconcern"] = "concern",
  ["laterality"] = "laterality",
  ["painscore"] = "PAINSCORE",
  ["bpposition"]="BPPOSITION",
  
  ["pews_wsbau"] = "pews_wsbau",
  ["pews_carersuggests"] = "pews_carersuggests",
  ["pews_crt"] = "pews_CRT",
  ["pews_sepsissuspicion"] = "pews_sepsissuspicion",
  ["pews_nmssuspicion"] = "pews_NMSsuspicion",
  ["pews_clinicalintuition"] = "pews_clinicalintuition",
  ["pews_clinicalconcern"] = "pews_clinicalconcern",
  ["respdistress"] = "respdistress",
  ["SPO2"] = "SPO2",
  ["HR"] = "HR",
  ["CLVL"] = "CLVL",
  ["PAINSCORE"] = "PAINSCORE",
  ["pews_respdevice"] = "pews_respdevice",
  ["INSPIREO2PERCENTAGE"] = "INSPIREO2PERCENTAGE",
  ["INSPIREO2LITREPERMIN"] = "INSPIREO2LITREPERMIN",
  ["pews_oxygensupport"] = "pews_oxygensupport",
  ["pews_respsupport"] = "pews_respsupport",
  ["pews_spo2probechange"] = "pews_spo2probechange"

}

//mapping chart observation names/headers to meaningful headers
export enum obsNameHeadersFromChart {
  //obscode keys
  ["OXYGENDEV"] = "Oxygen Device",
  ["ONOXYGEN"] = "On Oxygen?",
  ["TEMP"] = "Temperature",
  ["RESP"] = "Respirations",
  ["SPO2"] = "Oxygen Saturations",
  ["HR"] = "Pulse Rate",
  ["SBP"] = "Systolic Blood Pressure",
  ["DBP"] = "Diastolic Blood Pressure",
  ["CLVL"] = "Consciousness Level",
  ["BSC"] = "Bowels Open",
  ["glucose"] = "Glucose",
  ["PAINSCOREATREST"] = "Pain Score - Rest",
  ["PAINSCOREMOVEMENT"] = "Pain Score - Movement",

  ["laterality"] = "Laterality",
  ["HEIGHT"] = "Height",
  ["WEIGHT"] = "Weight",
  ["BPPOSITION"] = "BP Position",
  ["INSPIREO2PERCENTAGE"] = "Inspired Oxygen (%)",
  ["INSPIREO2LITREPERMIN"] = "Inspired Oxygen (L/min)",
  ["respdistress"] = "Respiratory Distress",
  ["concern"] = "Are there Doctor/Nurse/Family concerns?",
  ["concerns"] = " Doctor/Nurse/Family concerns",
  ["reasonfornobp"] = "Reason for not taking BP",
  ["monitoring"] = "Monitoring",
  ["escalationofcare"] = "Escalation",

  //non obscode keys
  ["painscore"] = "Pain Score",
  //Pew codes
  ["pews_sepsissuspicion"] = "New suspicion of sepsis or septic shock",
  ["pews_NMSsuspicion"] = "NMS",

  ["pews_wsbau"] = "Carer Question",
  ["pews_carersuggests"] = "Carer uses words that suggest the child",
  ["pews_clinicalintuition"] = "Clinical intuition",
  ["pews_clinicalconcern"] = "Specific Concern",
  ["pews_spo2probechange"] = "SPO2 Probe Change",
  ["pews_respdevice"] = "Respiratory Support Device",
  ["pews_oxygensupport"] = "Oxygen Delivery Method",

}

export enum pewsObsNameHeadersFromChart {
  ["RESP"] = "Respiratory Rate",
  ["respdistress"] = "Respiratory Distress",
  ["SPO2"] = "SpO2",
  ["pews_spo2probechange"] = "SPO2 Probe Change",
  ["pews_respsupport"] = "Respiratory Support",
  ["pews_respdevice"] = "Respiratory Support Device",
  ["pews_oxygensupport"] = "Oxygen Delivery Method",
  ["INSPIREO2LITREPERMIN"] = "Oxygen (L/min)",
  ["INSPIREO2PERCENTAGE"] = "Oxygen (%)",
  ["HR"] = "Heart Rate",
  ["BPPOSITION"] = "Blood Pressure",
  ["SBP"] = "Systolic Blood Pressure",
  ["DBP"] = "Diastolic Blood Pressure",
  ["pews_CRT"] = "CRT",
  ["PAINSCORE"] = "Pain Score",
  ["TEMP"] = "Temperature",
  ["pews_sepsissuspicion"] = "New suspicion of sepsis or septic shock",
  ["pews_NMSsuspicion"] = "NMS",
  ["monitoring"] = "Monitoring frequency",
  ["pews_wsbau"] = "Carer Question",
  ["pews_carersuggests"] = "Carer uses words that suggest the child",
  ["pews_clinicalintuition"] = "Clinical intuition",
  ["pews_clinicalconcern"] = "Specific Concern",

}

export enum obsUnits {
  ["OXYGENDEV"] = "",
  ["INSPIREO2PERCENTAGE"] = "%",
  ["INSPIREO2LITREPERMIN"] = "L/min",
  ["BPPOSITION"] = "",
  ["PAINSCOREMOVEMENT"] = "",
  ["PAINSCOREATREST"] = "",
  ["ONOXYGEN"] = "",
  ["TEMP"] = "°C",
  ["RESP"] = "breaths per minute",
  ["SPO2"] = "%",
  ["HR"] = "Bpm",
  ["SBP"] = "mmHg",
  ["DBP"] = "mmHg",
  ["CLVL"] = "",
  ["BSC"] = "",
  ["HEIGHT"] = "cm",
  ["WEIGHT"] = "kg",
  ["glucose"] = "",
  ["respdistress"] = "",
  ["concern"] = "",
  ["concerns"] = "",
  ["reasonfornobp"] = ""

}

export enum obsSortOrder {
  ["concern"] = 1,
  ["concerns"] = 2,
  ["RESP"] = 3,
  ["respdistress"] = 4,
  ["SPO2"] = 5,
  ["ONOXYGEN"] = 6,
  ["OXYGENDEV"] = 7,
  ["INSPIREO2PERCENTAGE"] = 8,
  ["INSPIREO2LITREPERMIN"] = 9,
  ["SBP"] = 10,
  ["DBP"] = 11,
  ["laterality"]=11.5,
  ["BPPOSITION"] = 12,
  ["HR"] = 13,
  ["CLVL"] = 14,
  ["TEMP"] = 15,
  ["PAINSCOREATREST"] = 16,
  ["PAINSCOREMOVEMENT"] = 17,
  ["glucose"] = 18,
  ["BSC"] = 19,
  ["HEIGHT"] = 20,
  ["WEIGHT"] = 21,
  ["ispatientsick"] = 22,
  ["couldbeinfection"] = 23,
  ["concernsaboutpatient"] = 24,
  ["reasonfornobp"] = 25,
  ["reasonfornotescalating"] = 26,
}

export enum pewsObsSortOrder {
  ["RESP"] = 2,
  ["respdistress"] = 3,
  ["SPO2"] = 4,
  ["pews_spo2probechange"] = 5,
  ["pews_respsupport"] = 6,
  ["pews_respdevice"] = 7,
  ["pews_oxygensupport"] = 8,
  ["INSPIREO2LITREPERMIN"] = 9,
  ["INSPIREO2PERCENTAGE"] = 10,
  ["HR"] = 11,
  ["BPPOSITION"] = 12,
  ["SBP"] = 13,
  ["DBP"] = 14,
  ["pews_CRT"] = 15,
  ["PAINSCORE"] = 16,
  ["TEMP"] = 17,
  ["pews_sepsissuspicion"] = 18,
  ["pews_NMSsuspicion"] = 19,
  ["monitoring"] = 20,
  ["pews_wsbau"] = 21,
  ["pews_carersuggests"] = 22,
  ["pews_clinicalintuition"] = 23,
  ["pews_clinicalconcern"] = 24,
}

export enum deviceDisplayName {
  ["NIV"] = "CPAP/BiPAP Mask",
  ["H"] = "Humidified Oxygen",
  ["N"] = "Nasal Canula",
  ["RM"] = "Reservoir Mask",
  ["SM"] = "Simple Mask",
  ["V"] = "Venturi Mask",
  ["TM"] = "Tracheostomy Mask",

  //old ones
  ["Venturi Mask"] = "Venturi Mask",
  ["Nasal cannulae"] = "Nasal cannulae",
  ["Non-rebreather mask"] = "Non-rebreather mask",

}

export enum consciousLevelDisplayName {
  ["A"] = "Alert",
  ["C"] = "Confusion",
  ["V"] = "Voice",
  ["P"] = "Pain",
  ["U"] = "Unresponsive",
}

export enum consciousLevelDisplayNamePEWS {
  //["A"] = "Awake/Responsive to voice",
  //["U"] = "Unresponsive to voice",
  ["A"] = "Alert",
  ["C"] = "Confusion",
  ["V"] = "Responsive to voice",
  ["P"] = "Responsive to pain",
  ["U"] = "Unresponsive",
  ["AS"] = "Asleep"
}

export enum monitoringDisplayName {
  ["monitoring"] = "Monitoring Frequency",
  ["escalationofcare"] = "Escalation of care",
  ["ispatientsick"] = "Does the patient look sick?",
  ["concernsaboutpatient"] = "Any other concerns about this patient?",
  ["couldbeinfection"] = "Could this be due to an infection?",
  ["reasonfornotescalating"] = "Reason for not escalating",
  ["escalatedtowhom"] = "Escalated to whom?",
  ["monitoringcomments"] = "Monitoring comments"
}

export enum carerQuestionDisplayName {
  ["W"] = "Worse",
  ["S"] = "Same",
  ["B"] = "Better",
  ["A"] = "Parent/carer asleep",
  ["U"] = "Unavailable",
}

export enum carerSuggetsDisplayName {
  ["IncreasedMonitoring"] = "Carer uses words that suggests the child needs increased monitoring or intervention despite the low PEWS. Has the parent or carer expressed concern about the YP physical health?",
  ["ClinicalReview"] = "Carer uses words that suggests the child needs a clinical review irrespective of PEWS.",
  ["RapidReview"] = "Carer uses words that suggests the child needs a 'Rapid Review' irrespective of PEWS.",
  ["CollapsedOrDeteriorated"] = "Carer uses words that suggests the child has collapsed or significantly deteriorated.",
}

export enum respiratorySupportDeviceDisplayName {
  ["HF"] = "High flow",
  ["BiP"] = "BiPAP",
  ["CP"] = "CPAP",
}

export enum oxygenDeliveryMethodDisplayName {
  ["NP"] = "Nasal prongs",
  ["FM"] = "Face mask",
  ["HB"] = "Head box",
  ["NRB"] = "Non-rebreather",
}

export enum positionBPDisplayName {
  ["LL"] = "Left leg",
  ["LA"] = "Left arm",
  ["RL"] = "Right leg",
  ["RA"] = "Right arm",
  ["U0"] = "Unsuccessful attempt(No concern - this scores 0)",
  ["U4"] = "Unsuccessful attempt (Concern - this scores 4)",
}

export enum sepsissuspicionDisplayName {
  ["no"] = "no",
  ["NewSepsis"] = "Sepsis",
  ["SepticShock"] = "Septic shock",
}

export enum nurseClinicianConcernDisplayName {
  ["IncreasedMonitoring"] = "Increased monitoring despite low PEWS",
  ["MedicalReview"] = "A medical review irrespective of PEWS",
  ["RapidReview"] = "A 'rapid review' irrespective of PEWS",
  ["EmergencyReview"] = "Emergency review for life-threatening situation",
}


export class Observationtypemeasurement {

  observationtypemeasurement_id: string
  observationtype_id: string
  symbol: string
  name: string
  active: boolean
}

export class Oxygendevices {
  oxygendevices_id: string
  name: string
  description: string
  active: boolean
}
export class Observationscaletype {

  observationscaletype_id: string
  scaletypename: string
  scaletypedescription: string
}

export class PersonObservationScale {
  personobservationscale_id: string;
  person_id: string;
  observationscaletype_id: string;
  reason:string;
  createdon:any;
  createdby:string;
  encounter_id:string;

}
