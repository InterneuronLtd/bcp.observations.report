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

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {

  encounterChange = new Subject();
  drawGraph = new Subject();
  OpenInfo = new Subject();
  closeObsForm = new Subject();
  closeObsPEWSForm = new Subject();
  openObsForm = new Subject();
  openObsPEWSForm = new Subject();
  openGuidance = new Subject();
  openPEWSGuidance = new Subject();
  newObs = new Subject();
  newPEWSObs = new Subject();
  amendObs = new Subject();
  amendPEWSObs = new Subject();

  openPopover = new Subject();
  closePopover = new Subject();
  openDeletePopover = new Subject();
  closeDeletePopover = new Subject();
  personIdChange = new Subject();
  apiServiceReferenceChange = new Subject();
  showMessage = new Subject();
  unload = new Subject();
  initialzeFormMetaData = new Subject();
  loadAssessmentModule = new Subject();
  frameworkEvent = new Subject();
  latestObservationEvent = new Subject();

  updateNextDueMessage = new Subject();
  savePersonscale = new Subject();
  refreshPersonalScale  = new Subject();

  constructor() {
  }
}
