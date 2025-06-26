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
// Interneuron Observation App
// Copyright(C) 2023  Interneuron Holdings Ltd
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// See the
// GNU General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with this program.If not, see<http://www.gnu.org/licenses/>.
import * as d3 from "d3";
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { Observationevent, deviceDisplayName } from '../models/observations.model';
import { log } from 'util';
import { Subscription } from "rxjs";
import { ApirequestService } from "../services/apirequest.service";


type Observation = { "units": string, "hasbeenammended": boolean, "observationvalue": any, guidance?: string };
type WarnignScore = { units: null, guidance: string, hasbeenammended: boolean, observationvalue: number }
type ObservationParameterGraph = { chart_id: string, Infobutton: string, chart_group: string, chartname: string, graph_id: string, graphname: string, units: string, graphtype: string, parameterkey: string[], chartgraphorder: number, parameterdomain: number[], secondaryparameterdomain: number[], ordinalparameterdomain: number[], ewsbandingrange: number[], parameterlabelsdomain: number[], scale: string[], graphlabeladditionaltext: string };
type GraphObservationData = { pulseunder48:boolean, observationevent_id: string, person_id: string, datestarted: string, datefinished: string, username: string, userid: number, isamended: boolean, earlywarningscore: WarnignScore, respirations: Observation, oxygensaturations: Observation, isonoxygen: Observation, device: string, systolicbloodpressure: Observation, diastolicbloodpressure: Observation, pulse: Observation, consciousness: Observation, temperature: Observation, painscore: number, glucose: number, bowelsopen: boolean, monitoring: boolean, hasbeenescalated: boolean, height: number, weight: number };
type LineCoordinates = { x: number, y: number }[];
//const parseServerDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");
const getInitialsFromUserName = function (d) { return d.split(" ").reverse().map((n) => n[0]).join(".") };
var dataWasTapped = false;
var ammendSymbolDataPointPath = d3.symbol().type(d3.symbolWye);
var symbolDataPointPath = d3.symbol().type(d3.symbolCircle);
var symbolSystolicBloodPressureDataPointPath = d3.symbol().type(d3.symbolTriangle);
var symbolDiastolicBloodPressureDataPointPath = symbolSystolicBloodPressureDataPointPath;

export class ObservationGraph {
  public yParameterScale: any;
  public yParameterLabelsScale: any;
  public yParameterAxis: any;
  private dataPointSize: number;
  private amendedDataPointSize: number;
  
   subscriptions: Subscription = new Subscription();

  public loadedScale="";

  constructor(private apiRequest: ApirequestService,private xDateGUIDScale: any, private chartSvg: any, private observationParameterGraph: ObservationParameterGraph, private observationParameterRange: number[], private subjects: SubjectsService, private appService: AppService, private isValueAmendable: boolean) {
    this.xDateGUIDScale = xDateGUIDScale;
    this.chartSvg = chartSvg;
    this.observationParameterGraph = observationParameterGraph;
    this.observationParameterRange = observationParameterRange;
    this.yParameterLabelsScale = d3.scaleOrdinal().domain(this.observationParameterGraph.parameterlabelsdomain).range(this.observationParameterRange);
    this.yParameterAxis = d3.axisLeft(this.yParameterLabelsScale).tickSizeOuter(0);

    //------------------------------------------------------------------------------------------------------------------------------
    //Create the scales
    //------------------------------------------------------------------------------------------------------------------------------

    switch (this.observationParameterGraph.graphtype) {
      case "Heading": {
        this.appService.logToConsole('Heading graphtype: ' + this.observationParameterGraph.graphtype);
      }
      case "Threshold": {
        this.yParameterScale = d3.scaleThreshold()
          .domain(this.observationParameterGraph.parameterdomain)
          .range(this.observationParameterRange);
        break;
      }
      case "Ordinal": {
        this.yParameterScale = d3.scaleOrdinal()
          .domain(this.observationParameterGraph.ordinalparameterdomain)
          .range(this.observationParameterRange);
        break;
      }
      default: {
        this.appService.logToConsole('END OF SWITCH STATEMENT reached for graphtype: ' + this.observationParameterGraph.graphtype);
        break;
      }
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------
  //Draw the Graph
  //------------------------------------------------------------------------------------------------------------------------------

  drawGraph(graphXPosition: number, graphYPosition: number, graphWidth: number, numberOfColumnsInTheChart: number, yAxisWidth: number, scale: any) {
    let columnWidth = graphWidth / numberOfColumnsInTheChart;
    this.dataPointSize = columnWidth * 1.0;
    this.amendedDataPointSize = this.dataPointSize * 1.6;
    let parameterRowHeight = columnWidth * 0.8;
    if (scale.includes("MARSI")) {
      parameterRowHeight = columnWidth * 0.4;
      this.dataPointSize = columnWidth * 0.8;
      this.amendedDataPointSize = this.dataPointSize * 1.3;
    }
    let parameterGraphHeight = parameterRowHeight * (this.observationParameterGraph.parameterlabelsdomain.length);
    let parameterLabelWidth = graphXPosition * 0.57;
    let adjustedBandingYPosition = graphYPosition - (parameterRowHeight / 2);
    this.appService.logToConsole("columnWidth = " + columnWidth);
    let chartWidth = graphWidth + yAxisWidth;

    d3.select("body").on("click", () => {
      this.cleanUpTooltips()
    });

    //------------------------------------------------------------------------------------------------------------------------------
    //Draw the Graph Y-axis Labels
    //------------------------------------------------------------------------------------------------------------------------------

    switch (this.observationParameterGraph.graphtype) {
      case "Heading": {
        //Add graph label text - none
        //Add graph tick text - none
        break;
      }
      default: {


        //Add graph label 
        this.chartSvg.append("rect")
          .attr("class", "label " + this.observationParameterGraph.chart_id)
          .attr("x", 0)
          .attr("y", graphYPosition)
          .attr("width", parameterLabelWidth)
          .attr("height", parameterGraphHeight);

        this.drawVerticalLines(this.chartSvg, 0, graphYPosition, parameterGraphHeight, parameterLabelWidth, 2, this.observationParameterGraph.graphname + "LabelVerticalLine");
        this.drawHorizontalLines(this.chartSvg, 0, graphYPosition, parameterLabelWidth, parameterGraphHeight, this.observationParameterGraph.parameterlabelsdomain.length + 1, this.observationParameterGraph.graphname + "LabelHorizontalLine");
        let labletext = this.observationParameterGraph.graphname + " " + (this.observationParameterGraph.units == null ? "" : this.observationParameterGraph.units)
        let shiftlableup = 0
        if (labletext.length > 25 && this.observationParameterGraph.parameterlabelsdomain.length <= 1) {
          shiftlableup = parameterLabelWidth * 0.0231
        }
        if (this.observationParameterGraph.chart_group && this.observationParameterGraph.chart_id.includes("pews")) {
          this.chartSvg.append("text")
            .attr("class", "largelabel " + this.observationParameterGraph.chart_id)
            .attr("x", 0)
            .attr("y", adjustedBandingYPosition + parameterRowHeight / 6)
            .attr("dy", "1.2em")
            .attr("dx", "0.1em")
            .text(() => {
              return (this.observationParameterGraph.chart_group);
            })
            .call(this.wrap, parameterLabelWidth);


          //Add graph label text
          this.chartSvg.append("text")
            .attr("class", "labelText " + this.observationParameterGraph.chart_id)
            .attr("x", 0)
            .attr("y", adjustedBandingYPosition + parameterRowHeight * (this.observationParameterGraph.graphname.includes("AVPU") ? .5 : this.observationParameterGraph.parameterkey.includes("pews_crt") ? 1 : 2))
            .attr("dy",this.observationParameterGraph.graphname.includes("AVPU")?"1.5em":"1.9em")
            .attr("dx",this.observationParameterGraph.graphname.includes("AVPU")?"2.4em":"0.4em")
            .text(() => {
              return this.observationParameterGraph.graphname + " " + (this.observationParameterGraph.units == null ? "" : this.observationParameterGraph.units);
            })
            .call(this.wrap, parameterLabelWidth - 10);

            
        }
        else if (this.observationParameterGraph.chart_group) {
          this.chartSvg.append("text")
            .attr("class", "largelabel " + this.observationParameterGraph.chart_id)
            .attr("x", 0)
            .attr("y", adjustedBandingYPosition + parameterRowHeight / 6)
            .attr("dy", "1.2em")
            .attr("dx", "0.1em")
            .text(() => {
              return (this.observationParameterGraph.chart_group);
            })
            .call(this.wrap, parameterLabelWidth);


          //Add graph label text
          this.chartSvg.append("text")
            .attr("class", "labelText " + this.observationParameterGraph.chart_id)
            .attr("x", 0)
            .attr("y", adjustedBandingYPosition + parameterRowHeight * 2)
            .attr("dy", "1.9em")
            .attr("dx", "0.4em")
            .text(() => {
              return this.observationParameterGraph.graphname + " " + (this.observationParameterGraph.units == null ? "" : this.observationParameterGraph.units);
            })
            .call(this.wrap, parameterLabelWidth - 10);
        }
        else {

          let valueshift = (adjustedBandingYPosition + parameterRowHeight / 4)
          this.chartSvg.append("text")
            .attr("class", "labelText " + this.observationParameterGraph.chart_id)
            .attr("x", 0)
            .attr("y", (adjustedBandingYPosition + parameterRowHeight / 4) - shiftlableup)
            .attr("dy", "1.9em")
            .attr("dx", "0.4em")
            .text(() => {
              return this.observationParameterGraph.graphname + " " + (this.observationParameterGraph.units == null ? "" : this.observationParameterGraph.units);
            })
            .call(this.wrap, parameterLabelWidth - 22);

  
        }
        if (this.observationParameterGraph.Infobutton) {
          const containerWidth = parameterLabelWidth * 0.8823;
          const containerHeight = parameterLabelWidth * 0.0999;
          const self = this;
          // Add an (i) icon in light blue at the top-right corner 
          this.chartSvg.append("image")
            .attr("href", "assets/images/Info.svg")  // Correct path for Angular assets
            .attr("x", containerWidth)      // Position to the right corner with padding
            .attr("y", adjustedBandingYPosition + containerHeight)  // Slight padding from top
            .attr("width", (parameterRowHeight / 2) + 5)    // Icon size
            .attr("height", (parameterRowHeight / 2) + 5)    // Icon size
            .attr("data-chart-id", this.observationParameterGraph.chart_id)  // Unique ID for each icon
            .style("cursor", "pointer")
            .on("click", function (event) {  // Use a normal function to access `this`
              const clickedElement = d3.select(this); // Get the clicked element
              const customParameter = self.observationParameterGraph.Infobutton; // Capture `this` correctly
              self.showPopupinfo(customParameter);  // Call the function with the correct context
            });

          }
        //Add graph label additional information + 
        //Add graph label additional information text
        let secondaryCss = this.observationParameterGraph.chart_id.startsWith('pews') ? "secondaryLabelText" : "secondaryLabelTextWight"
        this.chartSvg.append("text")
          .attr("class", secondaryCss + " " + this.observationParameterGraph.chart_id)
          .attr("x", 0)
          .attr("y", adjustedBandingYPosition + parameterGraphHeight / 2)
          .attr("dy", "1.9em")
          .attr("dx", "0.4em")
          .text(() => {
            return (this.observationParameterGraph.graphlabeladditionaltext ? this.observationParameterGraph.graphlabeladditionaltext : "");
          })
          .call(this.wrap, parameterLabelWidth - 4);
        const chartWidth = graphWidth;  // Replace this with a dynamic value if you have it
        const leftOffset = chartWidth * 0.10;  // 12% of chart width
        const rightOffset = chartWidth * 0.06; // 8% of chart width
        //Add graph tick text
        this.chartSvg.append("g")
          .attr("class", "yAxis " + this.observationParameterGraph.graph_id + "Graph")
          .attr("transform", "translate(" + (graphXPosition + columnWidth * 0.2) + ",0)")
          .call(this.yParameterAxis)
          .selectAll(".tick text")
          .each(function () {
            let text = d3.select(this);
            let originalText = text.text().trim();

            let x = text.attr("x") !== null ? parseFloat(text.attr("x")) : 0;
            let y = text.attr("y") !== null ? parseFloat(text.attr("y")) : 0;

            if (scale.includes("MARSI")) {
              x = x - 12 // for marsi chart
            }

            // Reset text for normal display if no "|"
            text.text(originalText)
              .attr("text-anchor", "end") // Default to right alignment
              .attr("x", x - 3); // Keep default X position

            if (originalText.includes(" | ")) {
              let [leftPart, rightPart] = originalText.split(" | ");

              console.log("Left:", leftPart, "Right:", rightPart);

              // Clear text before adding tspans
              text.text("");

              // Left-aligned text (move further left)
              text.append("tspan")
                .attr("x", x - leftOffset) // Move more left
                .attr("text-anchor", "end")
                .text(leftPart);

              // Right-aligned text (move left so it stays visible)
              text.append("tspan")
                .attr("x", x - rightOffset) // Move left slightly
                .attr("text-anchor", "start")
                .text(rightPart);
            }
          });
        break;
      }
    }

    //------------------------------------------------------------------------------------------------------------------------------
    //Draw the Graph EWS Banding background Rect 
    //------------------------------------------------------------------------------------------------------------------------------

    switch (this.observationParameterGraph.graphtype) {
      case "Heading": {
        //Add EWS banding
        this.appendGraphCellBackground(this.chartSvg, 0, this.observationParameterRange[0] - (parameterRowHeight / 2), chartWidth, parameterRowHeight, ("score" + this.observationParameterGraph.ewsbandingrange[0]));
        // Add EWS key - none
        //Draw chart lines
        this.drawVerticalLines(this.chartSvg, 0, graphYPosition, parameterGraphHeight, chartWidth, 2, this.observationParameterGraph.graphname + "ChartVerticalLine");
        this.drawHorizontalLines(this.chartSvg, 0, graphYPosition, chartWidth, parameterRowHeight, this.observationParameterGraph.parameterlabelsdomain.length + 1, this.observationParameterGraph.graphname + "ChartHorizontalLine");
        this.appendText(this.chartSvg, 0, this.observationParameterRange[0], 5, parameterRowHeight * 0.15, "text.heading", this.observationParameterGraph.parameterlabelsdomain[0]);

        break;
      }
      case "Threshold": {

        //Add EWS banding
        this.observationParameterRange.forEach((yValue, index) => {
          var prevXPos = graphXPosition;
          for (var i = 0; i < numberOfColumnsInTheChart; i++) {
            if (this.observationParameterGraph.scale[0] == "MARSI") {
              this.appendGraphCellBackground(this.chartSvg, prevXPos, yValue - (parameterRowHeight / 2), graphWidth / numberOfColumnsInTheChart, parameterRowHeight, ("MARSIscore" + this.observationParameterGraph.ewsbandingrange[index] + " X" + Math.ceil(prevXPos + (columnWidth / 2)) + " Y" + Math.ceil(yValue)));
            } else if (this.observationParameterGraph.scale[0] == "MEWS-Scale") {
              this.appendGraphCellBackground(this.chartSvg, prevXPos, yValue - (parameterRowHeight / 2), graphWidth / numberOfColumnsInTheChart, parameterRowHeight, ("MEWSscore" + this.observationParameterGraph.ewsbandingrange[index] + " X" + Math.ceil(prevXPos + (columnWidth / 2)) + " Y" + Math.ceil(yValue)));
            } else {
              this.appendGraphCellBackground(this.chartSvg, prevXPos, yValue - (parameterRowHeight / 2), graphWidth / numberOfColumnsInTheChart, parameterRowHeight, ("score" + this.observationParameterGraph.ewsbandingrange[index] + " X" + Math.ceil(prevXPos + (columnWidth / 2)) + " Y" + Math.ceil(yValue)));
            }
            prevXPos = prevXPos + graphWidth / numberOfColumnsInTheChart;
          }
        });

        // Add EWS key
        this.observationParameterRange.forEach((yValue, index) => {
          let className = this.observationParameterGraph.scale[0] === "MEWS-Scale"
            ? "MEWSkey" + this.observationParameterGraph.ewsbandingrange[index]
            : "key" + this.observationParameterGraph.ewsbandingrange[index];
          if (this.observationParameterGraph.scale[0] === "MARSI") {
            className = "MARSIkey" + this.observationParameterGraph.ewsbandingrange[index]
          }
          this.chartSvg.append("rect")
            .attr("class", className)
            .attr("x", graphXPosition + graphWidth + columnWidth * 0.63)
            .attr("y", this.yParameterLabelsScale(yValue) - (parameterRowHeight * 0.46))
            .attr("width", columnWidth * 0.8)
            .attr("height", parameterRowHeight * 0.94);

          this.chartSvg.append("text")
            .attr("class", "keyText " + "_" + this.observationParameterGraph.ewsbandingrange[index])
            .attr("x", graphXPosition + graphWidth + columnWidth * 0.95)
            .attr("y", this.yParameterLabelsScale(yValue) + (parameterRowHeight * 0.2))
            .text("" + this.observationParameterGraph.ewsbandingrange[index]);
        });

        //Draw chart lines
        this.drawVerticalLines(this.chartSvg, graphXPosition, graphYPosition, parameterGraphHeight, columnWidth, numberOfColumnsInTheChart + 1, this.observationParameterGraph.graphname + "ChartVerticalLine");
        this.drawHorizontalLines(this.chartSvg, graphXPosition, graphYPosition, graphWidth, parameterRowHeight, this.observationParameterGraph.parameterlabelsdomain.length + 1, this.observationParameterGraph.graphname + "ChartHorizontalLine");

        break;
      }
      case "Ordinal": {
        if (this.observationParameterGraph.ewsbandingrange.length != 0) {
          //Add EWS banding
          this.observationParameterRange.forEach((yValue, index) => {
            var prevXPos = graphXPosition;
            for (var i = 0; i < numberOfColumnsInTheChart; i++) {
              this.appendGraphCellBackground(this.chartSvg, prevXPos, yValue - (parameterRowHeight / 2), graphWidth / numberOfColumnsInTheChart, parameterRowHeight, ("score" + this.observationParameterGraph.ewsbandingrange[index] + " X" + Math.ceil(prevXPos + (columnWidth / 2)) + " Y" + Math.ceil(yValue)));
              prevXPos = prevXPos + graphWidth / numberOfColumnsInTheChart;
            }
          });

          // Add EWS key
          this.observationParameterRange.forEach((yValue, index) => {
            this.chartSvg.append("rect")
              .attr("class", "key" + this.observationParameterGraph.ewsbandingrange[index])
              .attr("x", graphXPosition + graphWidth + columnWidth * 0.7)
              .attr("y", this.yParameterLabelsScale(yValue) - (parameterRowHeight * 0.46))
              .attr("width", columnWidth * 0.8)
              .attr("height", parameterRowHeight * 0.94);

            this.chartSvg.append("text")
              .attr("class", "keyText " + "_" + this.observationParameterGraph.ewsbandingrange[index])
              .attr("x", graphXPosition + graphWidth + columnWidth * 0.95)
              .attr("y", this.yParameterLabelsScale(yValue) + (parameterRowHeight * 0.2))
              .text("" + this.observationParameterGraph.ewsbandingrange[index]);
          });
        }
        //Draw chart lines
        this.drawVerticalLines(this.chartSvg, graphXPosition, graphYPosition, parameterGraphHeight, columnWidth, numberOfColumnsInTheChart + 1, this.observationParameterGraph.graphname + "ChartVerticalLine");
        this.drawHorizontalLines(this.chartSvg, graphXPosition, graphYPosition, graphWidth, parameterRowHeight, this.observationParameterGraph.parameterlabelsdomain.length + 1, this.observationParameterGraph.graphname + "ChartHorizontalLine");


        break;
      }
      default: {
        //this.appService.logToConsole('End of switch statement reached for graphtype: ' + this.observationParameterGraph.graphtype);
        break;
      }
    }


  }

  //------------------------------------------------------------------------------------------------------------------------------




  addPewsData(observationData: GraphObservationData[],scale:any, graphWidth: number,) { // Called for each graph 
    this.loadedScale=scale
    //add the data points
    let graphSvg = this.chartSvg.append("g");



    // loop through each graph for each data parameter key on that graph 
    for (let index = 0; index < this.observationParameterGraph.parameterkey.length; index++) {

      switch (this.observationParameterGraph.graphtype) {
        case "Heading": {
          // no data for headings - add the heading text
          break;
        }
        case "Threshold": {

          var parameterDataPointCoordinates: LineCoordinates = []; //save data point coordinates

          if (
            this.observationParameterGraph.parameterkey[index] !== "pews_spo2probechange" &&
            this.observationParameterGraph.parameterkey[index] !== "oxygen" &&
            this.observationParameterGraph.parameterkey[index] !== "temperature" &&
            this.observationParameterGraph.parameterkey[index] !== "pews_site" &&
            this.observationParameterGraph.parameterkey[index] !== "inspireoxygenlitrepermin" &&
            this.observationParameterGraph.parameterkey[index] !== "airoxygen" &&
            this.observationParameterGraph.parameterkey[index] !== "inspireoxygenpercentage" &&
            this.observationParameterGraph.parameterkey[index] !== "airinliter" &&
            this.observationParameterGraph.parameterkey[index] !== "bpcode" &&
            this.observationParameterGraph.parameterkey[index] !== "pews_respdevice") {
            graphSvg.selectAll("path." + this.observationParameterGraph.parameterkey[index])
              .data(observationData.filter((d) => {
                // loop though each observation event for a given graph parameter
                // get the parameterDataPointCoordinates and join the dots
                // add any logic for specific ordinal graph_id's
                if (d[this.observationParameterGraph.parameterkey[index]] != null && d[this.observationParameterGraph.parameterkey[index]].observationvalue != null && this.observationParameterGraph.scale.includes(d["scale"])) {
                  if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {
                    //NEWS scale 2 on oxygen uses a different domain and range.
                    let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                      .domain(this.observationParameterGraph.secondaryparameterdomain)
                      .range(this.observationParameterRange);

                    parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });
                  } else {
                    parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });

                  }
                } else {
                  // if there is a break in the data - join the dots and break the line
                  this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
                  parameterDataPointCoordinates = [];
                }
                return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
              }))
              .enter()
              .append("path") // draw the data point
              .attr("class", (d, i) => {
                return "dataPoint " + this.observationParameterGraph.parameterkey[index];
              })
              .attr("d", (d) => {
                var dataPointSymbol = symbolDataPointPath.size(this.dataPointSize)();

                if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                  dataPointSymbol = ammendSymbolDataPointPath.size(this.amendedDataPointSize)();
                } else {
                  if (this.observationParameterGraph.parameterkey[index] == 'systolicbloodpressure' || this.observationParameterGraph.parameterkey[index] == 'diastolicbloodpressure') {
                    dataPointSymbol = symbolSystolicBloodPressureDataPointPath.size(this.dataPointSize)();
                  }
                };

                return dataPointSymbol;
              })
              .attr("transform", (d, i) => {
                const x = this.xDateGUIDScale(d.observationevent_id);
                var y;
                var rotation = 180;

                if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {

                  let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                    .domain(this.observationParameterGraph.secondaryparameterdomain)
                    .range(this.observationParameterRange);

                  y = news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
                } else {
                  y = this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
                }

                if (this.observationParameterGraph.parameterkey[index] == 'diastolicbloodpressure') {
                  rotation = 0;
                  y = y + this.amendedDataPointSize * 0.1;
                } else if (this.observationParameterGraph.parameterkey[index] == 'systolicbloodpressure') {
                  y = y - this.amendedDataPointSize * 0.1;
                }

                return "translate(" + x + "," + y + ") rotate(" + rotation + ")";
              })
              .on("click", (event, d) => {
                const observation: Observation = { units: this.observationParameterGraph.units, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue };
                this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event), event;
                return;
              });
          }
          if (this.observationParameterGraph.parameterkey[index] === "pews_spo2probechange") {
            // console.log(this.xDateGUIDScale(d.observationevent_id));
            // Add 'Y' text for pews_spo2probechange
            graphSvg.selectAll("text." + this.observationParameterGraph.parameterkey[index])
              .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
              .enter()
              .append("text")
              .attr("class", (d, i) => {
                var classname = "" + this.observationParameterGraph.parameterkey[index];
                if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                  classname = "value " + classname;
                } else { classname = "value ammended " + classname; };
                return classname;
              })
              .attr("x", (d) => this.xDateGUIDScale(d.observationevent_id))
              .attr("y", (d) => this.observationParameterRange[0])
              .style("text-anchor", "middle")
              .style("alignment-baseline", "middle")
              .text((d) => d[this.observationParameterGraph.parameterkey[index]].observationvalue == "true" ? "Y" : "N")
              .on("click", (event, d) => {
                const observation: Observation = {
                  units: this.observationParameterGraph.units,
                  hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                  observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
                };
                this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
                return;
              });
          }


          if (this.observationParameterGraph.parameterkey[index] === "inspireoxygenlitrepermin") {

           // const cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;

            const chartWidth = graphWidth * 0.02777

                let cellWidth: number;

                if (this.xDateGUIDScale.range()[1] ===  this.xDateGUIDScale.range()[0]) {
                  cellWidth =chartWidth // 5% of the chart width
                } else {
                  cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
                  }

            graphSvg.selectAll("text." + this.observationParameterGraph.parameterkey[index])
              .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
              .enter()
              .append("text")
              .attr("class", (d) => {
                let classname = "value " + this.observationParameterGraph.parameterkey[index];
                if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                  classname += " ammended";
                }
                return classname;
              })
              .attr("x", (d) => {
                const plotYrange = this.getYindexForValues(
                  d[this.observationParameterGraph.parameterkey[index]]?.observationvalue,
                  d["inspireoxygenpercentage"]?.observationvalue
                );
                // let movedotleft = 0;
                let movexright = 0;
                if (plotYrange.firstValue && plotYrange.secondValue && plotYrange.firstValue.value === plotYrange.secondValue.value) {
                  // movedotleft = -cellWidth * 0.25;
                  movexright = cellWidth * 0.29;
                }
                return this.xDateGUIDScale(d.observationevent_id) + movexright;
              })
              .attr("y", (d) => {
                const plotYrange = this.getYindexForValues(
                  d[this.observationParameterGraph.parameterkey[index]]?.observationvalue,
                  d["inspireoxygenpercentage"]?.observationvalue
                );
                return this.observationParameterRange[plotYrange.firstValue?.value] + cellWidth * 0.1;
              })
              .attr("text-anchor", "middle")
             
              .text("X")
              .on("click", (event, d) => {
                const observation: Observation = {
                  units:"L/minute",
                  hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                  observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
                };
                this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
              });
          }

          if (this.observationParameterGraph.parameterkey[index] === "inspireoxygenpercentage") {

            const chartWidth = graphWidth * 0.02777

            let cellWidth: number;

            if (this.xDateGUIDScale.range()[1] ===  this.xDateGUIDScale.range()[0]) {
              cellWidth =chartWidth // 5% of the chart width
            } else {
              cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
}

            graphSvg.selectAll("circle." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
            .enter()
            .append("path")
            .attr("class", "symbol dot")
            .attr("d", (d) => {
              return d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
                ? "M2.129,1.229L2.129,5.487L-2.129,5.487L-2.129,1.229L-5.817,-0.9L-3.688,-4.588L0,-2.458L3.688,-4.588L5.817,-0.9Z"
                : d3.symbol().type(d3.symbolCircle).size(cellWidth * 1.5625)();
            })
            .attr("fill", "black")
            .attr("transform", (d) => {
              const plotYrange = this.getYindexForValues(
                d["inspireoxygenlitrepermin"]?.observationvalue,
                d[this.observationParameterGraph.parameterkey[index]]?.observationvalue
              );
              let movedotleft = 0;
              if (
                plotYrange.firstValue &&
                plotYrange.secondValue &&
                plotYrange.firstValue.value === plotYrange.secondValue.value
              ) {
                movedotleft = -cellWidth * 0.29;
              }
              const x = this.xDateGUIDScale(d.observationevent_id) + movedotleft;
              const y = d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
              ? this.observationParameterRange[plotYrange.secondValue?.value] - cellWidth * 0.1 // adjust this number for size
              :  this.observationParameterRange[plotYrange.secondValue?.value] - cellWidth * 0.04;
           //   const y = this.observationParameterRange[plotYrange.secondValue?.value] - cellWidth * 0.04;
              const scaleFactor = d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
                ? cellWidth / 25 // adjust this number for size
                : 1;
              return `translate(${x}, ${y}) scale(${scaleFactor})`;
            })
            .on("click", (event, d) => {
              const observation: Observation = {
                units: "%",
                hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
              };
              this.dataTapped(
                observation,
                d.observationevent_id,
                this.observationParameterGraph.parameterkey[index],
                d.scale,
                d,
                event
              );
            });
          
          }

          // Temparature plot
          if (this.observationParameterGraph.parameterkey[index] === "temperature") {

            const chartWidth = graphWidth * 0.02777

            let cellWidth: number;

            if (this.xDateGUIDScale.range()[1] ===  this.xDateGUIDScale.range()[0]) {
              cellWidth =chartWidth // 5% of the chart width
            } else {
              cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
              }

            graphSvg.selectAll("circle." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
            .enter()
            .append("path")
            .attr("class", "symbol dot")
            .attr("d", (d) => {
              return d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
                ? "M2.129,1.229L2.129,5.487L-2.129,5.487L-2.129,1.229L-5.817,-0.9L-3.688,-4.588L0,-2.458L3.688,-4.588L5.817,-0.9Z"
                : d3.symbol().type(d3.symbolCircle).size(cellWidth * 1.5625)();
            })
            .attr("fill", "black")
            .attr("transform", (d) => {
              const plotYrange = this.getYindexForValuesforTemperature(             
                d[this.observationParameterGraph.parameterkey[index]]?.observationvalue
              );
              let movedotleft = -cellWidth * 0.29;
          
              const x = this.xDateGUIDScale(d.observationevent_id) + movedotleft;
              const y = d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
              ? this.observationParameterRange[plotYrange] - cellWidth * 0.1 // adjust this number for size
              :  this.observationParameterRange[plotYrange] - cellWidth * 0.04;
           //   const y = this.observationParameterRange[plotYrange.secondValue?.value] - cellWidth * 0.04;
              const scaleFactor = d[this.observationParameterGraph.parameterkey[index]].hasbeenammended
                ? cellWidth / 25 // adjust this number for size
                : 1;
              return `translate(${x}, ${y}) scale(${scaleFactor})`;
            })
            .on("click", (event, d) => {
              const observation: Observation = {
                units: " °",
                hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
              };
              this.dataTapped(
                observation,
                d.observationevent_id,
                this.observationParameterGraph.parameterkey[index],
                d.scale,
                d,
                event
              );
            });
          
          }



          //site
          if (this.observationParameterGraph.parameterkey[index] === "pews_site") {

            // const cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
 
             const chartWidth = graphWidth * 0.02777
 
                 let cellWidth: number;
 
                 if (this.xDateGUIDScale.range()[1] ===  this.xDateGUIDScale.range()[0]) {
                   cellWidth =chartWidth // 5% of the chart width
                 } else {
                   cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
                   }
 
             graphSvg.selectAll("text." + this.observationParameterGraph.parameterkey[index])
               .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
               .enter()
               .append("text")
               .attr("class", (d) => {
                 let classname = "value " + this.observationParameterGraph.parameterkey[index];
                 if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                   classname += " ammended";
                 }
                 return classname;
               })
               .attr("x", (d) => {
               
                 // let movedotleft = 0;
                 let movexright =cellWidth * 0.29;
                
                 return this.xDateGUIDScale(d.observationevent_id) + movexright;
               })
               .attr("y", (d) => {
                const plotYrange = this.getYindexForValuesforTemperature(                  
                  d["temperature"]?.observationvalue
                );
                 return this.observationParameterRange[plotYrange] + cellWidth * 0.1;
               })
               .attr("text-anchor", "middle")
             
               .text((d) => {
                const observationObject = d[this.observationParameterGraph.parameterkey[index]];
               return observationObject.observationvalue;
               })
               .on("click", (event, d) => {
                 const observation: Observation = {
                   units:"",
                   hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                   observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
                 };
                 this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
               });
           }

          if (this.observationParameterGraph.parameterkey[index] === "bpcode" || this.observationParameterGraph.parameterkey[index] === "airoxygen" || this.observationParameterGraph.parameterkey[index] === "pews_respdevice" || this.observationParameterGraph.parameterkey[index] === "airinliter") {
            // console.log("observationData:", observationData);
            // console.log("Parameter Key:", this.observationParameterGraph.parameterkey[index]);
            // console.log("graphSvg:", graphSvg);
            //  const filteredData = observationData.filter((d) => d["airoxygen"] != null);
            // console.log("Filtered Data:", filteredData);
            // console.log("X Scale Test:", this.xDateGUIDScale(observationData[0]?.observationevent_id));
            // console.log("Y Position Test:", this.observationParameterRange[1]);
  
            graphSvg.selectAll("text." + this.observationParameterGraph.parameterkey[index])
              .data(observationData.filter((d) => d[this.observationParameterGraph.parameterkey[index]] != null))
              .enter()
              .append("text")
              .attr("class", (d, i) => {
                var classname = "" + this.observationParameterGraph.parameterkey[index];
                if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                  classname = "value " + classname;
                } else { classname = "value ammended " + classname; };
                return classname;
              })
              .attr("x", (d) => this.xDateGUIDScale(d.observationevent_id))
              .attr("y", (d) => {
                const param = this.observationParameterGraph.parameterkey[index]
                if (param === "airinliter") return this.observationParameterRange[0];
                if (param === "bpcode") 
                  {
                    if(this.observationParameterGraph.chart_id === "pews-13to18yrs"){  
                    return this.observationParameterRange[16];
                    }else{
                      return this.observationParameterRange[14];
                    }
                  }
             
                if (param === "airoxygen"){ 
                  return this.observationParameterRange[1];
                }
                if (param === "pews_respdevice") return this.observationParameterRange[13];
                return this.observationParameterRange[0]; // default to FlowRate if not specified
              })
              .style("text-anchor", "middle")
              .style("alignment-baseline", "middle")
              .text((d) => {
                const param = this.observationParameterGraph.parameterkey[index];
                const observationValue = d[param].observationvalue;

                // if (param === "airinliter") {
                //   return observationValue;  // Example modification
                // }
                // if (param === "bpcode") {
                //   return observationValue;
                // }

                // if (param === "pews_respdevice") {
                //   return observationValue;
                // }
                // if (param === "airoxygen"){ 
                //   return observationValue;
                // }
                return observationValue; // Default case
              })
              .on("click", (event, d) => {
                const observation: Observation = {
                  units:"",
                  hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended,
                  observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue
                };
                if (this.observationParameterGraph.parameterkey[index] == "airoxygen") {
                  if (observation.observationvalue == "A") {
                    this.dataTapped(observation, d.observationevent_id, "pews_respsupport", d.scale, d, event);
                  }
                  else {
                    this.dataTapped(observation, d.observationevent_id, "pews_oxygensupport", d.scale, d, event);
                  }
                }
                else if (this.observationParameterGraph.parameterkey[index] == "bpcode") {
                  this.dataTapped(observation, d.observationevent_id, "bpposition", d.scale, d, event);
                }
                else if (this.observationParameterGraph.parameterkey[index] == "airinliter") {
                  observation.units="L/minute"
                  this.dataTapped(observation, d.observationevent_id, "inspireoxygenlitrepermin", d.scale, d, event);
                } else {
                  this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
                }
                return;
              });
          }

          this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
          break;
        }
        case "Ordinal": {
          var text = ""
          graphSvg.selectAll("text.value." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // this.appService.logToConsole("d[this.observationParameterGraph.parameterkey[index]].observationvalue = "+d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              // d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("text") // draw the data point
            .attr("class", (d, i) => {
              // if(d.patientrefused && this.observationParameterGraph.graph_id == "news2"){
              //   classname = "value ";
              //   return classname  
              // }
              var classname = "" + this.observationParameterGraph.parameterkey[index];
              if(d[this.observationParameterGraph.parameterkey[index]].guidance == "EMERGENCY (E)" && this.observationParameterGraph.parameterkey[index] == "earlywarningscore"){
                classname =  "valueWhight " + classname;
                return classname;
              }
              if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                classname = "value " + classname;

              } else {

                classname = "value ammended " + classname;

              };
              return classname;
            })
            .text((d) => {
              //logic for specific ordinal charts

              const observationObject = d[this.observationParameterGraph.parameterkey[index]];
              text = ""
              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.graph_id == "news2") {

                if (observationObject != null) {
                  if (observationObject.observationvalue != null && this.isPartialScore(d)) {
                    text = observationObject.observationvalue + "(p)";
                  }
                  else if (observationObject != null) {
                    if (observationObject.observationvalue != null) {
                      text = observationObject.observationvalue;
                    }
                  }
                }
              }
              else if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.graph_id.startsWith("PEWS")) {

                if (observationObject != null) {
                  if (observationObject.observationvalue != null && d.ispartial) {
                    text = observationObject.observationvalue + "(p)";
                  }
                  else if (observationObject != null) {
                    if (observationObject.observationvalue != null) {
                      text = observationObject.observationvalue;
                    }
                  }
                }
              }
              else if (observationObject != null) {
                if (observationObject.observationvalue != null) {
                  text = observationObject.observationvalue;
                }
              }
              switch (this.observationParameterGraph.graph_id) {
             
                case "pews-13to18yrs-escalationeevel":
                case "pews-5to12yrs-escalationeevel":
                  if (observationObject.guidance) {
                    text = observationObject.guidance.split("(")[1].replace(")", "")

                  }
                  else {
                    text = ""
                  }

                  break;
                  case "pews_5to12escalationto":
                case "pews_13to18escalationto":
                  if (observationObject.observationvalue == "Doctor") { text = "D"; }
                  else if (observationObject.observationvalue == "Nurse") { text = "N"; }
                  else {
                    text = "";
                  };
                  break;
                case "pews_5to12escalation":
                case "pews_13to18escalation":
                  if (observationObject.observationvalue == true) { text = "Y"; }
                  else {
                    text = "N";
                  };
                  break;
                case "pews_5to12sepsissuspicion":
                case "pews_13to18sepsissuspicion":
                  if (observationObject.observationvalue.toLowerCase() == 'no') { text = "N"; }
                  else {
                    text = "Y";
                  };
                  break;
                case "pews_5to12nmssuspicion":
                case  "pews_13to18nmssuspicion":
                  if (observationObject.observationvalue.toLowerCase() == 'no') { text = "N"; }
                  else {
                    text = "Y";
                  };
                  break;
                case "pews_5to12clinicalintuition":
                case "pews_13to18clinicalintuition":
                  if (observationObject.observationvalue.toLowerCase() == 'no') { text = "N"; }
                  else {
                    text = "Y";
                  };
                  break;
                case "respiratorydistress-pews-0to11mo":
                case "respiratorydistress-pews-1to4yrs":
                case "respiratorydistress-pews-5to12yrs":
                case "respiratorydistress-pews-13to18yrs":
                  if (observationObject.observationvalue == 'severe') { text = "Sev"; }
                  else if (observationObject.observationvalue == 'moderate') { text = "Mod"; }
                  else if (observationObject.observationvalue == 'mild') { text = "Mild"; }
                  else if (observationObject.observationvalue == 'none') { text = "None"; }
                  else {
                    text = "";
                  };
                  break;
                case "isonoxygen":
                case "isonoxygen-pews-0to11mo":
                case "isonoxygen-pews-1to4yrs":
                case "isonoxygen-pews-5to12yrs":
                case "isonoxygen-pews-13to18yrs":
                  if (observationObject.observationvalue == false) {
                    text = "A"
                  }
                  else if (observationObject.observationvalue == true) {
                    text = "O";
                  }
                  else {
                    text = "";
                  };
                  break;
                case "oxygenflow":
                case "oxygenflow-pews-0to11mo":
                case "oxygenflow-pews-1to4yrs":
                case "oxygenflow-pews-5to12yrs":
                case "oxygenflow-pews-13to18yrs":
                  text = text + (text ? "L" : "");
                  break;
                case "oxygenpercentage":
                case "oxygenpercentage-pews-0to11mo":
                case "oxygenpercentage-pews-1to4yrs":
                case "oxygenpercentage-pews-5to12yrs":
                case "oxygenpercentage-pews-13to18yrs":
                  text = text + (text ? "%" : "");
                  break;
                case "recordedby":
                case "recordedby-pews-0to11mo":
                case "recordedby-pews-1to4yrs":
                case "recordedby-pews-5to12yrs":
                case "recordedby-pews-13to18yrs": {
                  text = getInitialsFromUserName(observationObject);
                  break;
                }
                case "device":
                case "device-pews-0to11mo":
                case "device-pews-1to4yrs":
                case "device-pews-5to12yrs":
                case "device-pews-13to18yrs":
                  {
                    //  text = deviceDisplayName[observationObject.observationvalue];
                    //  text = observationObject.observationvalue;
                  }
                  break;
                case "bowelsopen":
                case "bowelsopen-pews-0to11mo":
                case "bowelsopen-pews-1to4yrs":
                case "bowelsopen-pews-5to12yrs":
                case "bowelsopen-pews-13to18yrs":
                case "escalationofcare":
                case "escalationofcare-pews-0to11mo":
                case "escalationofcare-pews-1to4yrs":
                case "escalationofcare-pews-5to12yrs":
                case "escalationofcare-pews-13to18yrs":
                case "concern":
                case "concern-pews-0to11mo":
                case "concern-pews-1to4yrs":
                case "concern-pews-5to12yrs":
                case "concern-pews-13to18yrs": {
                  switch (observationObject.observationvalue) {
                    case false:
                      text = "N";
                      break;
                    case true:
                      text = "Y";
                      break;
                    default:
                      text = "";
                      break;
                  }
                  break;
                }
                default: {
                  //this.appService.logToConsole('END OF SWITCH STATEMENT reached for graph_id: ' + this.observationParameterGraph.graph_id);
                  break;
                }
              };
              return text;
            })
            .attr("x", (d, i) => { return this.xDateGUIDScale(d.observationevent_id); })
            .attr("y", (d, i) => {
              return this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
            })
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .attr("transform", (d) => {
              if (this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                const classString = "rect." + "X" + Math.ceil(this.xDateGUIDScale(d.observationevent_id)) + ".Y" + Math.ceil(this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue));
                var rect = d3.selectAll(classString);
                var value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;
                var ewsClassString = this.getCssClassforEWSScore(d.scale, value, d[this.observationParameterGraph.parameterkey[index]].guidance);
                this.appService.logToConsole(ewsClassString);
                rect.attr("class", ewsClassString);
              }
              return "translate(0,0)";
            })
            .on("click", (event, d, k, l) => {
              console.log(event.currentTarget.value)
              let unit = this.observationParameterGraph.units;
              let value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;

              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.parameterkey[index] == "monitoring") {
                if (value.includes("H")) {
                  unit = "hours";

                } else if (value.includes("M")) {
                  unit = "minutes"
                }
                else if (value.includes("D")) {
                  unit = "days"
                }
                else if (value.includes("W")) {
                  unit = "weeks"
                }
                else if (value.includes("S")) {
                  unit = "stoped"
                }
                else if (value.includes("P")) {
                  unit = "paused"
                }
                value = value.substring(0, value.length - 1);
              }
              if(this.observationParameterGraph.parameterkey[index] == "earlywarningscore"){
                const observationobj: Observation = { units: unit, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: value, guidance: d[this.observationParameterGraph.parameterkey[index]].guidance };
                this.loadobservations({ score: observationobj.observationvalue, observationevent_id:  d.observationevent_id, guidance:  observationobj.guidance, ewsScaleType:  d.scale })
              }
              else if(this.observationParameterGraph.parameterkey[index] != "escalatedto" && this.observationParameterGraph.parameterkey[index] != "escalation" && this.observationParameterGraph.parameterkey[index] != "escalationeevel"){
              const observation: Observation = { units: unit, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: value, guidance: d[this.observationParameterGraph.parameterkey[index]].guidance };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
              }
            });
          break;
        }
        default: {
          break;
        }
      }
    }
    this.addDataLinesForBloodPressure(observationData);
  }

  addData(observationData: GraphObservationData[],scale) { // Called for each graph 
    this.loadedScale=scale
    //add the data points
    let graphSvg = this.chartSvg.append("g");

    // loop through each graph for each data parameter key on that graph 
    for (let index = 0; index < this.observationParameterGraph.parameterkey.length; index++) {

      switch (this.observationParameterGraph.graphtype) {
        case "Heading": {
          // no data for headings - add the heading text
          break;
        }
        case "Threshold": {

          var parameterDataPointCoordinates: LineCoordinates = []; //save data point coordinates

          graphSvg.selectAll("path." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // get the parameterDataPointCoordinates and join the dots
              // add any logic for specific ordinal graph_id's
              if (d[this.observationParameterGraph.parameterkey[index]] != null && d[this.observationParameterGraph.parameterkey[index]].observationvalue != null && this.observationParameterGraph.scale.includes(d["scale"])) {
                if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {
                  //NEWS scale 2 on oxygen uses a different domain and range.
                  let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                    .domain(this.observationParameterGraph.secondaryparameterdomain)
                    .range(this.observationParameterRange);

                  parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });
                } else {
                  parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });

                }
              } else {
                // if there is a break in the data - join the dots and break the line
                this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
                parameterDataPointCoordinates = [];
              }
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("path") // draw the data point
            .attr("class", (d, i) => {
              return "dataPoint " + this.observationParameterGraph.parameterkey[index];
            })
            .attr("d", (d) => {
              var dataPointSymbol = symbolDataPointPath.size(this.dataPointSize)();

              if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                dataPointSymbol = ammendSymbolDataPointPath.size(this.amendedDataPointSize)();
              } else {
                if (this.observationParameterGraph.parameterkey[index] == 'systolicbloodpressure' || this.observationParameterGraph.parameterkey[index] == 'diastolicbloodpressure') {
                  dataPointSymbol = symbolSystolicBloodPressureDataPointPath.size(this.dataPointSize)();
                }
              };

              return dataPointSymbol;
            })
            .attr("transform", (d, i) => {
              const x = this.xDateGUIDScale(d.observationevent_id);
              var y;
              var rotation = 180;

              if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {

                let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                  .domain(this.observationParameterGraph.secondaryparameterdomain)
                  .range(this.observationParameterRange);

                y = news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              } else {
                y = this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              }

              if (this.observationParameterGraph.parameterkey[index] == 'diastolicbloodpressure') {
                rotation = 0;
                y = y + this.amendedDataPointSize * 0.1;
              } else if (this.observationParameterGraph.parameterkey[index] == 'systolicbloodpressure') {
                y = y - this.amendedDataPointSize * 0.1;
              }

              return "translate(" + x + "," + y + ") rotate(" + rotation + ")";
            })
            .on("click", (event, d) => {
              const observation: Observation = { units: this.observationParameterGraph.units, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event), event;
              return;
            });

          this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
          break;
        }
        case "Ordinal": {
          var text = ""
          graphSvg.selectAll("text.value." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // this.appService.logToConsole("d[this.observationParameterGraph.parameterkey[index]].observationvalue = "+d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              // d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("text") // draw the data point
            .attr("class", (d, i) => {
              // if(d.patientrefused && this.observationParameterGraph.graph_id == "news2"){
              //   classname = "value ";
              //   return classname  
              // }
              var classname = "" + this.observationParameterGraph.parameterkey[index];
              if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                classname = "value " + classname;

              } else {

                classname = "value ammended " + classname;

              };
              return classname;
            })
            .text((d) => {
              //logic for specific ordinal charts

              const observationObject = d[this.observationParameterGraph.parameterkey[index]];
              text = ""
              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.graph_id == "news2") {

                if (observationObject != null) {
                  if (observationObject.observationvalue != null && this.isPartialScore(d)) {
                    text = observationObject.observationvalue + "(p)";
                  }
                  else if (observationObject != null) {
                    if (observationObject.observationvalue != null) {
                      text = observationObject.observationvalue;
                    }
                  }
                }
              }
              else if (observationObject != null) {
                if (observationObject.observationvalue != null) {
                  text = observationObject.observationvalue;
                }
              }
              switch (this.observationParameterGraph.graph_id) {

                case "respiratorydistress-pews-0to11mo":
                case "respiratorydistress-pews-1to4yrs":
                case "respiratorydistress-pews-5to12yrs":
                case "respiratorydistress-pews-13to18yrs":
                  if (observationObject.observationvalue == 'severe') { text = "Sev"; }
                  else if (observationObject.observationvalue == 'moderate') { text = "Mod"; }
                  else if (observationObject.observationvalue == 'mild') { text = "Mild"; }
                  else if (observationObject.observationvalue == 'none') { text = "None"; }
                  else {
                    text = "";
                  };
                  break;
                case "isonoxygen":
                case "isonoxygen-pews-0to11mo":
                case "isonoxygen-pews-1to4yrs":
                case "isonoxygen-pews-5to12yrs":
                case "isonoxygen-pews-13to18yrs":
                  if (observationObject.observationvalue == false) {
                    text = "A"
                  }
                  else if (observationObject.observationvalue == true) {
                    text = "O";
                  }
                  else {
                    text = "";
                  };
                  break;
                case "oxygenflow":
                case "oxygenflow-pews-0to11mo":
                case "oxygenflow-pews-1to4yrs":
                case "oxygenflow-pews-5to12yrs":
                case "oxygenflow-pews-13to18yrs":
                  text = text + (text ? "L" : "");
                  break;
                case "oxygenpercentage":
                case "oxygenpercentage-pews-0to11mo":
                case "oxygenpercentage-pews-1to4yrs":
                case "oxygenpercentage-pews-5to12yrs":
                case "oxygenpercentage-pews-13to18yrs":
                  text = text + (text ? "%" : "");
                  break;
                case "recordedby":
                case "recordedby-pews-0to11mo":
                case "recordedby-pews-1to4yrs":
                case "recordedby-pews-5to12yrs":
                case "recordedby-pews-13to18yrs": {
                  text = getInitialsFromUserName(observationObject);
                  break;
                }
                case "device":
                case "device-pews-0to11mo":
                case "device-pews-1to4yrs":
                case "device-pews-5to12yrs":
                case "device-pews-13to18yrs":
                  {
                    //  text = deviceDisplayName[observationObject.observationvalue];
                    //  text = observationObject.observationvalue;
                  }
                  break;
                case "bowelsopen":
                case "bowelsopen-pews-0to11mo":
                case "bowelsopen-pews-1to4yrs":
                case "bowelsopen-pews-5to12yrs":
                case "bowelsopen-pews-13to18yrs":
                case "escalationofcare":
                case "escalationofcare-pews-0to11mo":
                case "escalationofcare-pews-1to4yrs":
                case "escalationofcare-pews-5to12yrs":
                case "escalationofcare-pews-13to18yrs":
                case "concern":
                case "concern-pews-0to11mo":
                case "concern-pews-1to4yrs":
                case "concern-pews-5to12yrs":
                case "concern-pews-13to18yrs": {
                  switch (observationObject.observationvalue) {
                    case false:
                      text = "N";
                      break;
                    case true:
                      text = "Y";
                      break;
                    default:
                      text = "";
                      break;
                  }
                  break;
                }
                default: {
                  //this.appService.logToConsole('END OF SWITCH STATEMENT reached for graph_id: ' + this.observationParameterGraph.graph_id);
                  break;
                }
              };
              return text;
            })
            .attr("x", (d, i) => { return this.xDateGUIDScale(d.observationevent_id); })
            .attr("y", (d, i) => {
              return this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
            })
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .attr("transform", (d) => {
              if (this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                const classString = "rect." + "X" + Math.ceil(this.xDateGUIDScale(d.observationevent_id)) + ".Y" + Math.ceil(this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue));
                var rect = d3.selectAll(classString);
                var value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;
                var ewsClassString = this.getCssClassforEWSScore(d.scale, value, d[this.observationParameterGraph.parameterkey[index]].guidance);
                this.appService.logToConsole(ewsClassString);
                rect.attr("class", ewsClassString);
              }
              return "translate(0,0)";
            })
            .on("click", (event, d, k, l) => {
              console.log(event.currentTarget.value)
              let unit = this.observationParameterGraph.units;
              let value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;

              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.parameterkey[index] == "monitoring") {
                if (value.includes("H")) {
                  unit = "hours";

                } else if (value.includes("M")) {
                  unit = "minutes"
                }
                else if (value.includes("D")) {
                  unit = "days"
                }
                else if (value.includes("W")) {
                  unit = "weeks"
                }
                else if (value.includes("S")) {
                  unit = "stoped"
                }
                else if (value.includes("P")) {
                  unit = "paused"
                }
                value = value.substring(0, value.length - 1);
              }
              else {

              }
              const observation: Observation = { units: unit, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: value, guidance: d[this.observationParameterGraph.parameterkey[index]].guidance };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
            });
          break;
        }
        default: {
          break;
        }
      }
    }
    this.addDataLinesForBloodPressure(observationData);
  }
  addMEWSData(observationData: GraphObservationData[],scale) { // Called for each graph 
    this.loadedScale=scale
    //add the data points
    let graphSvg = this.chartSvg.append("g");

    // loop through each graph for each data parameter key on that graph 
    for (let index = 0; index < this.observationParameterGraph.parameterkey.length; index++) {

      switch (this.observationParameterGraph.graphtype) {
        case "Heading": {
          // no data for headings - add the heading text
          break;
        }
        case "Threshold": {

          var parameterDataPointCoordinates: LineCoordinates = []; //save data point coordinates
          let filterData = observationData

     
          if( this.observationParameterGraph.graph_id == "pulse48" ){
            filterData=filterData.filter(x=>x.pulseunder48 != true)
          }
          if( this.observationParameterGraph.graph_id == "pulse" ){
            filterData=filterData.filter(x=>x.pulseunder48 == true)
          }

          graphSvg.selectAll("path." + this.observationParameterGraph.parameterkey[index])
            .data(filterData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // get the parameterDataPointCoordinates and join the dots
              // add any logic for specific ordinal graph_id's
              
            

              if (d[this.observationParameterGraph.parameterkey[index]] != null && d[this.observationParameterGraph.parameterkey[index]].observationvalue != null && this.observationParameterGraph.scale.includes(d["scale"])) {              
                  parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });

               
              } else {
                // if there is a break in the data - join the dots and break the line
                if(this.observationParameterGraph.parameterkey[index] =="systolicbloodpressure" || this.observationParameterGraph.parameterkey[index] == "diastolicbloodpressure" ){
                  this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", "");
                }
                else{
                  this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
                }
                parameterDataPointCoordinates = [];
              }
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("path") // draw the data point
            .attr("class", (d, i) => {// diastolicbloodpressure othere chart color is diffrent so no need here
              return "dataPoint " + this.observationParameterGraph.parameterkey[index] == "diastolicbloodpressure" ? "" : this.observationParameterGraph.parameterkey[index];
            })
            .attr("d", (d) => {
              var dataPointSymbol = symbolDataPointPath.size(this.dataPointSize)();

              if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                dataPointSymbol = ammendSymbolDataPointPath.size(this.amendedDataPointSize)();
              }
              return dataPointSymbol;
            })
            .attr("transform", (d, i) => {
              const x = this.xDateGUIDScale(d.observationevent_id);
              var y;
              var rotation = 180;         
                y = this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);           

              return "translate(" + x + "," + y + ") rotate(" + rotation + ")";
            })
            .on("click", (event, d) => {
              const observation: Observation = { units: this.observationParameterGraph.units, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event), event;
              return;
            });
            if(this.observationParameterGraph.parameterkey[index] =="systolicbloodpressure" || this.observationParameterGraph.parameterkey[index] == "diastolicbloodpressure" ){
              this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", "");
            }
            else{
              this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
            }
        
          break;
        }
        case "Ordinal": {
          var text = ""
          graphSvg.selectAll("text.value." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // this.appService.logToConsole("d[this.observationParameterGraph.parameterkey[index]].observationvalue = "+d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              // d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("text") // draw the data point
            .attr("class", (d, i) => {
              // if(d.patientrefused && this.observationParameterGraph.graph_id == "news2"){
              //   classname = "value ";
              //   return classname  
              // }
              var classname = "" + this.observationParameterGraph.parameterkey[index];
              if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                classname = "value " + classname;

              } else {

                classname = "value ammended " + classname;

              };
              return classname;
            })
            .text((d) => {
              //logic for specific ordinal charts

              const observationObject = d[this.observationParameterGraph.parameterkey[index]];
              text = ""
              if (this.appService.appConfig.environment == 'mental_healthcare') {

                if (observationObject != null) {
                  if (observationObject.observationvalue != null && d.ispartial && this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                    text = observationObject.observationvalue + "(p)";
                  }
                  else if (observationObject != null) {
                    if (observationObject.observationvalue != null) {
                      text = observationObject.observationvalue;
                    }
                  }
                }
              }
              else if (observationObject != null) {
                if (observationObject.observationvalue != null) {
                  text = observationObject.observationvalue;
                }
              }
              switch (this.observationParameterGraph.graph_id) {
                case "mewsHealthcare":
                  case "mews_familyconcerned":
                      case "mews_additionaltherapies":
                          case "mews_increasedpain":
                              case "mews_vaginalbleeding":
                                  case "mews_reducedurineoutput":
                                      case "mews_alteredlevelconsciousnessresponsiveness":
                  if (observationObject.observationvalue == 'yes') { text = "Y"; }
                  else if (observationObject.observationvalue == 'no') { text = "N"; }                
                  else {
                    text = "";
                  };
                  break;
                case "respiratorydistress-pews-0to11mo":
                case "respiratorydistress-pews-1to4yrs":
                case "respiratorydistress-pews-5to12yrs":
                case "respiratorydistress-pews-13to18yrs":
                  if (observationObject.observationvalue == 'severe') { text = "Sev"; }
                  else if (observationObject.observationvalue == 'moderate') { text = "Mod"; }
                  else if (observationObject.observationvalue == 'mild') { text = "Mild"; }
                  else if (observationObject.observationvalue == 'none') { text = "None"; }
                  else {
                    text = "";
                  };
                  break;
                case "isonoxygen":
                case "isonoxygen-pews-0to11mo":
                case "isonoxygen-pews-1to4yrs":
                case "isonoxygen-pews-5to12yrs":
                case "isonoxygen-pews-13to18yrs":
                  if (observationObject.observationvalue == false) {
                    text = "A"
                  }
                  else if (observationObject.observationvalue == true) {
                    text = "O";
                  }
                  else {
                    text = "";
                  };
                  break;
                case "oxygenflow":
                case "oxygenflow-pews-0to11mo":
                case "oxygenflow-pews-1to4yrs":
                case "oxygenflow-pews-5to12yrs":
                case "oxygenflow-pews-13to18yrs":
                  text = text + (text ? "L" : "");
                  break;
                case "oxygenpercentage":
                case "oxygenpercentage-pews-0to11mo":
                case "oxygenpercentage-pews-1to4yrs":
                case "oxygenpercentage-pews-5to12yrs":
                case "oxygenpercentage-pews-13to18yrs":
                  text = text + (text ? "%" : "");
                  break;
                case "recordedby":
                case "recordedby-pews-0to11mo":
                case "recordedby-pews-1to4yrs":
                case "recordedby-pews-5to12yrs":
                case "recordedby-pews-13to18yrs": {
                  text = getInitialsFromUserName(observationObject);
                  break;
                }
                case "device":
                case "device-pews-0to11mo":
                case "device-pews-1to4yrs":
                case "device-pews-5to12yrs":
                case "device-pews-13to18yrs":
                  {
                    //  text = deviceDisplayName[observationObject.observationvalue];
                    //  text = observationObject.observationvalue;
                  }
                  break;
                case "bowelsopen":
                case "bowelsopen-pews-0to11mo":
                case "bowelsopen-pews-1to4yrs":
                case "bowelsopen-pews-5to12yrs":
                case "bowelsopen-pews-13to18yrs":
                case "escalationofcare":
                case "escalationofcare-pews-0to11mo":
                case "escalationofcare-pews-1to4yrs":
                case "escalationofcare-pews-5to12yrs":
                case "escalationofcare-pews-13to18yrs":
                case "concern":
                case "concern-pews-0to11mo":
                case "concern-pews-1to4yrs":
                case "concern-pews-5to12yrs":
                case "concern-pews-13to18yrs": {
                  switch (observationObject.observationvalue) {
                    case false:
                      text = "N";
                      break;
                    case true:
                      text = "Y";
                      break;
                    default:
                      text = "";
                      break;
                  }
                  break;
                }
                default: {
                  //this.appService.logToConsole('END OF SWITCH STATEMENT reached for graph_id: ' + this.observationParameterGraph.graph_id);
                  break;
                }
              };
              return text;
            })
            .attr("x", (d, i) => { return this.xDateGUIDScale(d.observationevent_id); })
            .attr("y", (d, i) => {
              return this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
            })
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .attr("transform", (d) => {
              if (this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                const classString = "rect." + "X" + Math.ceil(this.xDateGUIDScale(d.observationevent_id)) + ".Y" + Math.ceil(this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue));
                var rect = d3.selectAll(classString);
                var value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;
                var ewsClassString = this.getCssClassforEWSScore(d.scale, value, d[this.observationParameterGraph.parameterkey[index]].guidance);
                this.appService.logToConsole(ewsClassString);
                rect.attr("class", ewsClassString);
              }
              return "translate(0,0)";
            })
            .on("click", (event, d, k, l) => {
              console.log(event.currentTarget.value)
              let unit = this.observationParameterGraph.units;
              let value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;

              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.parameterkey[index] == "monitoring") {
                if (value.includes("H")) {
                  unit = "hours";

                } else if (value.includes("M")) {
                  unit = "minutes"
                }
                else if (value.includes("D")) {
                  unit = "days"
                }
                else if (value.includes("W")) {
                  unit = "weeks"
                }
                else if (value.includes("S")) {
                  unit = "stoped"
                }
                else if (value.includes("P")) {
                  unit = "paused"
                }
                value = value.substring(0, value.length - 1);
              }
              else {

              }
              const observation: Observation = { units: unit, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: value, guidance: d[this.observationParameterGraph.parameterkey[index]].guidance };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
            });
          break;
        }
        default: {
          break;
        }
      }
    }
   // this.addDataLinesForBloodPressure(observationData);
  }

  addMARSIData(observationData: GraphObservationData[], scale, graphWidth: number) { // Called for each graph 
    this.loadedScale = scale
    //add the data points
    let graphSvg = this.chartSvg.append("g");
    let cellWidth: number;
    const chartWidth = graphWidth * 0.02777
    if (this.xDateGUIDScale.range()[1] === this.xDateGUIDScale.range()[0]) {
      cellWidth = chartWidth // 5% of the chart width
    } else {
      cellWidth = (this.xDateGUIDScale.range()[1] - this.xDateGUIDScale.range()[0]) / observationData.length;
    }
    // loop through each graph for each data parameter key on that graph 
    for (let index = 0; index < this.observationParameterGraph.parameterkey.length; index++) {

      switch (this.observationParameterGraph.graphtype) {
        case "Heading": {
          // no data for headings - add the heading text
          break;
        }
        case "Threshold": {

          var parameterDataPointCoordinates: LineCoordinates = []; //save data point coordinates

          graphSvg.selectAll("path." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // get the parameterDataPointCoordinates and join the dots
              // add any logic for specific ordinal graph_id's
              if (d[this.observationParameterGraph.parameterkey[index]] != null && d[this.observationParameterGraph.parameterkey[index]].observationvalue != null && this.observationParameterGraph.scale.includes(d["scale"])) {
                if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {
                  //NEWS scale 2 on oxygen uses a different domain and range.
                  let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                    .domain(this.observationParameterGraph.secondaryparameterdomain)
                    .range(this.observationParameterRange);

                  parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });
                } else {
                  parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue) });

                }
              } else {
                // if there is a break in the data - join the dots and break the line
                // if there is a break in the data - join the dots and break the line
                if (this.observationParameterGraph.parameterkey[index] != "systolicsitting" && this.observationParameterGraph.parameterkey[index] != "diastolicsitting" && this.observationParameterGraph.parameterkey[index] != "systolicstanding" && this.observationParameterGraph.parameterkey[index] != "diastolicstanding") {
                  //   this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", "");
                  this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
                }

                parameterDataPointCoordinates = [];

              }
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("path") // draw the data point
            .attr("class", (d, i) => {
              return "dataPoint " + this.observationParameterGraph.parameterkey[index];
            })
            .attr("d", (d) => {
              var dataPointSymbol = symbolDataPointPath.size(this.dataPointSize)();

              if (d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                dataPointSymbol = ammendSymbolDataPointPath.size(this.amendedDataPointSize)();
              } else {
                if (this.observationParameterGraph.parameterkey[index] == 'systolicsitting' || this.observationParameterGraph.parameterkey[index] == 'diastolicsitting') {
                  dataPointSymbol = symbolSystolicBloodPressureDataPointPath.size(this.dataPointSize)();
                }
                if (this.observationParameterGraph.parameterkey[index] == 'systolicstanding' || this.observationParameterGraph.parameterkey[index] == 'diastolicstanding') {
                  dataPointSymbol = symbolSystolicBloodPressureDataPointPath.size(this.dataPointSize)();
                }
              };

              return dataPointSymbol;
            })
            .attr("transform", (d, i) => {
              let x = this.xDateGUIDScale(d.observationevent_id);
              if (this.observationParameterGraph.parameterkey[index] == 'diastolicsitting' || this.observationParameterGraph.parameterkey[index] == 'systolicsitting') {
                x = x - (cellWidth * 0.3035)
              }
              if (this.observationParameterGraph.parameterkey[index] == 'diastolicstanding' || this.observationParameterGraph.parameterkey[index] == 'systolicstanding') {
                x = x + (cellWidth * 0.3035)
              }
              var y;
              var rotation = 180;

              if (d["isonoxygen"] != null && d["isonoxygen"].observationvalue && this.observationParameterGraph.graph_id == "news2oxygensaturations_scale2") {

                let news2oxygensaturations_scale2YScale = d3.scaleThreshold()
                  .domain(this.observationParameterGraph.secondaryparameterdomain)
                  .range(this.observationParameterRange);

                y = news2oxygensaturations_scale2YScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              } else {
                y = this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              }
              if (this.observationParameterGraph.parameterkey[index] == 'systolicsitting' || this.observationParameterGraph.parameterkey[index] == 'systolicstanding') {
                y = y + 2
              }
              if (this.observationParameterGraph.parameterkey[index] == 'diastolicsitting' || this.observationParameterGraph.parameterkey[index] == 'diastolicstanding') {
                y = y - 2
              }

              if (this.observationParameterGraph.parameterkey[index] == 'diastolicsitting' || this.observationParameterGraph.parameterkey[index] == 'diastolicstanding') {
                rotation = 0;
                y = y + this.amendedDataPointSize * 0.1;
              } else if (this.observationParameterGraph.parameterkey[index] == 'systolicsitting' || this.observationParameterGraph.parameterkey[index] == 'systolicstanding') {
                y = y - this.amendedDataPointSize * 0.1;
              }

              return "translate(" + x + "," + y + ") rotate(" + rotation + ")";
            })
            .on("click", (event, d) => {
              const observation: Observation = { units: this.observationParameterGraph.units, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: d[this.observationParameterGraph.parameterkey[index]].observationvalue };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event), event;
              return;
            });
          if (this.observationParameterGraph.parameterkey[index] != "systolicsitting" && this.observationParameterGraph.parameterkey[index] != "diastolicsitting" && this.observationParameterGraph.parameterkey[index] != "systolicstanding" && this.observationParameterGraph.parameterkey[index] != "diastolicstanding") {
            //   this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", "");
            this.joinTheDots(graphSvg, parameterDataPointCoordinates, "trendLine", this.observationParameterGraph.parameterkey[index]);
          }
          break;
        }
        case "Ordinal": {
          var text = ""
          graphSvg.selectAll("text.value." + this.observationParameterGraph.parameterkey[index])
            .data(observationData.filter((d) => {
              // loop though each observation event for a given graph parameter
              // this.appService.logToConsole("d[this.observationParameterGraph.parameterkey[index]].observationvalue = "+d[this.observationParameterGraph.parameterkey[index]].observationvalue);
              // d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
              return d[this.observationParameterGraph.parameterkey[index]] != null && this.observationParameterGraph.scale.includes(d["scale"]);
            }))
            .enter()
            .append("text") // draw the data point
            .attr("class", (d, i) => {
              // if(d.patientrefused && this.observationParameterGraph.graph_id == "news2"){
              //   classname = "value ";
              //   return classname  
              // }
              var classname = "" + this.observationParameterGraph.parameterkey[index];
              if (!d[this.observationParameterGraph.parameterkey[index]].hasbeenammended) {
                classname = "value " + classname;

              } else {

                classname = "value ammended " + classname;

              };
              return classname;
            })
            .text((d) => {
              //logic for specific ordinal charts

              const observationObject = d[this.observationParameterGraph.parameterkey[index]];
              text = ""
              if (this.appService.appConfig.environment == 'mental_healthcare') {

                if (observationObject != null) {
                  if (observationObject.observationvalue != null && d.ispartial && this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                    text = observationObject.observationvalue + "(p)";
                  }
                  else if (observationObject != null) {
                    if (observationObject.observationvalue != null) {
                      text = observationObject.observationvalue;
                    }
                  }
                }
              }
              else if (observationObject != null) {
                if (observationObject.observationvalue != null) {
                  text = observationObject.observationvalue;
                }
              }
              switch (this.observationParameterGraph.graph_id) {
                case "mewsHealthcare":
                case "mews_familyconcerned":
                case "mews_additionaltherapies":
                case "mews_increasedpain":
                case "mews_vaginalbleeding":
                case "mews_reducedurineoutput":
                case "mews_alteredlevelconsciousnessresponsiveness":
                  if (observationObject.observationvalue == 'yes') { text = "Y"; }
                  else if (observationObject.observationvalue == 'no') { text = "N"; }
                  else {
                    text = "";
                  };
                  break;
                case "respiratorydistress-pews-0to11mo":
                case "respiratorydistress-pews-1to4yrs":
                case "respiratorydistress-pews-5to12yrs":
                case "respiratorydistress-pews-13to18yrs":
                  if (observationObject.observationvalue == 'severe') { text = "Sev"; }
                  else if (observationObject.observationvalue == 'moderate') { text = "Mod"; }
                  else if (observationObject.observationvalue == 'mild') { text = "Mild"; }
                  else if (observationObject.observationvalue == 'none') { text = "None"; }
                  else {
                    text = "";
                  };
                  break;
                case "isonoxygen":
                case "isonoxygen-pews-0to11mo":
                case "isonoxygen-pews-1to4yrs":
                case "isonoxygen-pews-5to12yrs":
                case "isonoxygen-pews-13to18yrs":
                  if (observationObject.observationvalue == false) {
                    text = "A"
                  }
                  else if (observationObject.observationvalue == true) {
                    text = "O";
                  }
                  else {
                    text = "";
                  };
                  break;
                case "oxygenflow":
                case "oxygenflow-pews-0to11mo":
                case "oxygenflow-pews-1to4yrs":
                case "oxygenflow-pews-5to12yrs":
                case "oxygenflow-pews-13to18yrs":
                  text = text + (text ? "L" : "");
                  break;
                case "oxygenpercentage":
                case "oxygenpercentage-pews-0to11mo":
                case "oxygenpercentage-pews-1to4yrs":
                case "oxygenpercentage-pews-5to12yrs":
                case "oxygenpercentage-pews-13to18yrs":
                  text = text + (text ? "%" : "");
                  break;
                case "recordedby":
                case "recordedby-pews-0to11mo":
                case "recordedby-pews-1to4yrs":
                case "recordedby-pews-5to12yrs":
                case "recordedby-pews-13to18yrs": {
                  text = getInitialsFromUserName(observationObject);
                  break;
                }
                case "device":
                case "device-pews-0to11mo":
                case "device-pews-1to4yrs":
                case "device-pews-5to12yrs":
                case "device-pews-13to18yrs":
                  {
                    //  text = deviceDisplayName[observationObject.observationvalue];
                    //  text = observationObject.observationvalue;
                  }
                  break;
                case "bowelsopen":
                case "bowelsopen-pews-0to11mo":
                case "bowelsopen-pews-1to4yrs":
                case "bowelsopen-pews-5to12yrs":
                case "bowelsopen-pews-13to18yrs":
                case "escalationofcare":
                case "escalationofcare-pews-0to11mo":
                case "escalationofcare-pews-1to4yrs":
                case "escalationofcare-pews-5to12yrs":
                case "escalationofcare-pews-13to18yrs":
                case "concern":
                case "concern-pews-0to11mo":
                case "concern-pews-1to4yrs":
                case "concern-pews-5to12yrs":
                case "concern-pews-13to18yrs": {
                  switch (observationObject.observationvalue) {
                    case false:
                      text = "N";
                      break;
                    case true:
                      text = "Y";
                      break;
                    default:
                      text = "";
                      break;
                  }
                  break;
                }
                default: {
                  //this.appService.logToConsole('END OF SWITCH STATEMENT reached for graph_id: ' + this.observationParameterGraph.graph_id);
                  break;
                }
              };
              return text;
            })
            .attr("x", (d, i) => { return this.xDateGUIDScale(d.observationevent_id); })
            .attr("y", (d, i) => {
              return this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue);
            })
            .style("text-anchor", "middle")
            .style("alignment-baseline", "middle")
            .attr("transform", (d) => {
              if (this.observationParameterGraph.parameterkey[index] == "earlywarningscore") {
                const classString = "rect." + "X" + Math.ceil(this.xDateGUIDScale(d.observationevent_id)) + ".Y" + Math.ceil(this.yParameterScale(d[this.observationParameterGraph.parameterkey[index]].observationvalue));
                var rect = d3.selectAll(classString);
                var value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;
                var ewsClassString = this.getCssClassforEWSScore(d.scale, value, d[this.observationParameterGraph.parameterkey[index]].guidance);
                this.appService.logToConsole(ewsClassString);
                rect.attr("class", ewsClassString);
              }
              return "translate(0,0)";
            })
            .on("click", (event, d, k, l) => {
              console.log(event.currentTarget.value)
              let unit = this.observationParameterGraph.units;
              let value = d[this.observationParameterGraph.parameterkey[index]].observationvalue;

              if (this.appService.appConfig.environment == 'mental_healthcare' && this.observationParameterGraph.parameterkey[index] == "monitoring") {
                if (value.includes("H")) {
                  unit = "hours";

                } else if (value.includes("M")) {
                  unit = "minutes"
                }
                else if (value.includes("D")) {
                  unit = "days"
                }
                else if (value.includes("W")) {
                  unit = "weeks"
                }
                else if (value.includes("S")) {
                  unit = "stoped"
                }
                else if (value.includes("P")) {
                  unit = "paused"
                }
                value = value.substring(0, value.length - 1);
              }
              else {

              }
              const observation: Observation = { units: unit, hasbeenammended: d[this.observationParameterGraph.parameterkey[index]].hasbeenammended, observationvalue: value, guidance: d[this.observationParameterGraph.parameterkey[index]].guidance };
              this.dataTapped(observation, d.observationevent_id, this.observationParameterGraph.parameterkey[index], d.scale, d, event);
            });
          break;
        }
        default: {
          break;
        }
      }
    }
    this.addDataLinesForBloodPressure(observationData, cellWidth);
  }
  getCssClassforEWSScore(ewsscale: string, score: any, guidance: string) {
    let cssclass = "";
    if (score == "R") {
      return cssclass = "EWS_R"
        ;
    }
    if (this.loadedScale.includes("MARSI")) {
      let cssclass = this.appService.appConfig.appsettings.marsiguidance["guidance" + this.removeSpaces(guidance) + "_cssclass"];
      if (!cssclass) {
        return cssclass = "EWS_R"
      }
      return cssclass
    }
    if (this.loadedScale.includes("MEWS")) {
      let cssclass = this.appService.appConfig.appsettings.MEWSguidance["guidance" + this.removeSpaces(guidance) + "_cssclass"];
      if (!cssclass) {
        return cssclass = "EWS_R"
      }
      return cssclass
    }
    if (this.loadedScale.includes("PEWS")) {
      let cssclass = this.appService.appConfig.appsettings.pewsguidance["guidance" + this.removeSpaces(guidance) + "_cssclass"];
      if (!cssclass) {
        return cssclass = "EWS_R"
      }
      return cssclass
    }
    if (score != null && score != undefined) {
      if (this.appService.isNewsScale(ewsscale)) {
        if (guidance.split(" ")[0] == "LOW/MEDIUM") {
          cssclass = this.appService.appConfig.appsettings.news2guidance.score3single_cssclass;
        }
        else
          if (score == 0) {
            cssclass = this.appService.appConfig.appsettings.news2guidance.score0_cssclass;
          }
          else if (score > 0 && score < 5) {
            cssclass = this.appService.appConfig.appsettings.news2guidance.score1to4_cssclass;
          }
          else if (score > 4 && score < 7) {
            cssclass = this.appService.appConfig.appsettings.news2guidance.score5to6_cssclass;
          }
          else if (score > 6) {
            cssclass = this.appService.appConfig.appsettings.news2guidance.score7ormore_cssclass;
          }
      }
      else
        if (!this.appService.isNewsScale(ewsscale)) {
          cssclass = this.appService.appConfig.appsettings.pewsguidance["score" + score + "_cssclass"];
        }
    }
    return cssclass;
  }
  removeSpaces(str: string | null | undefined): string {
    return str ? str.replace(/[\s_-]+/g, '') : '';
  }
  addDataLinesForBloodPressure(observationData: GraphObservationData[], cellWidth = 0) { // called for each graph

    let graphBloodPressureLineSvg = this.chartSvg.append("g");
    var parameterDataPointCoordinates: LineCoordinates = []; //save data point coordinates

    if (this.observationParameterGraph.parameterkey[0] == 'systolicbloodpressure') {
      observationData.forEach(d => {
        if (d[this.observationParameterGraph.parameterkey[0]] && d[this.observationParameterGraph.parameterkey[1]] && this.observationParameterGraph.scale.includes(d["scale"])) {
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[0]].observationvalue) });
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[1]].observationvalue) });
          this.joinTheDots(graphBloodPressureLineSvg, parameterDataPointCoordinates, "verticalLine", "bloodPressure");
          parameterDataPointCoordinates = [];
        }
      });
    }
    if (this.observationParameterGraph.parameterkey[0] == 'systolicsitting') {
      observationData.forEach(d => {
        if (d[this.observationParameterGraph.parameterkey[0]] && d[this.observationParameterGraph.parameterkey[1]] && this.observationParameterGraph.scale.includes(d["scale"])) {
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id) - (cellWidth * 0.3035), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[0]].observationvalue) });
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id) - (cellWidth * 0.3035), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[1]].observationvalue) });
          this.joinTheDots(graphBloodPressureLineSvg, parameterDataPointCoordinates, "verticalLine", "bloodPressure");
          parameterDataPointCoordinates = [];
        }
      });
    }
    if (this.observationParameterGraph.parameterkey[2] == 'systolicstanding') {
      observationData.forEach(d => {
        if (d[this.observationParameterGraph.parameterkey[2]] && d[this.observationParameterGraph.parameterkey[3]] && this.observationParameterGraph.scale.includes(d["scale"])) {
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id) + (cellWidth * 0.3035), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[2]].observationvalue) });
          parameterDataPointCoordinates.push({ x: this.xDateGUIDScale(d.observationevent_id) + (cellWidth * 0.3035), y: this.yParameterScale(d[this.observationParameterGraph.parameterkey[3]].observationvalue) });
          this.joinTheDots(graphBloodPressureLineSvg, parameterDataPointCoordinates, "verticalLine", "bloodPressure");
          parameterDataPointCoordinates = [];
        }
      });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------
  //Helper functions
  //------------------------------------------------------------------------------------------------------------------------------

  lineGenerator = d3.line().x(function (d, i) { return d.x; }).y(function (d, i) { return d.y; }).curve(d3.curveLinear); //draws the lines between the dots


  drawVerticalLines(chartGroup, x, y, chartHeight, columnWidth, numberOfLines, classOfLine) {
    for (let i = 0; i < numberOfLines; i++) {
      var verticalLineDataPoints = [];
      var dx = x + (i * columnWidth);
      var dy = y + chartHeight;
      verticalLineDataPoints.push({ x: dx, y: y });
      verticalLineDataPoints.push({ x: dx, y: dy });

      chartGroup.append("path")
        .attr("class", classOfLine)
        .attr("stroke", "black")
        .attr("d", this.lineGenerator(verticalLineDataPoints));
    }
  }

  drawHorizontalLines(chartGroup, x, y, graphWidth, rowHeight, numberOfLines, classOfLine) {
    for (let i = 0; i < numberOfLines; i++) {
      var horizontalLineDataPoints = [];
      var dx = x + graphWidth;
      var dy = y + (i * rowHeight);
      horizontalLineDataPoints.push({ x: x, y: dy });
      horizontalLineDataPoints.push({ x: dx, y: dy });

      chartGroup.append("path")
        .attr("class", classOfLine)
        .attr("stroke", "black")
        .attr("d", this.lineGenerator(horizontalLineDataPoints));
    }
  }

  wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        dx = parseFloat(text.attr("dx")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", dx + "em").attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  joinTheDots(group: any, lineCoordinates: LineCoordinates, className: string, name: string) {
    group.append("path")
      .attr("class", className + " " + name)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("d", this.lineGenerator(lineCoordinates));
  };

  dataTapped(observation: Observation, observationevent_id: string, name: string, scale: string, observationData: any, event: any): void {
    dataWasTapped = true;
    var tooltip: any


    if (name == "earlywarningscore" && observationData.earlywarningscore && observationData.earlywarningscore.observationvalue == 'R') {
      tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("position", "absolute");
      tooltip.style("opacity", 1).style("left", event.pageX - this.dataPointSize * 1.5 + "px").style("top", event.pageY - this.dataPointSize * 3.4 + "px");

    }
    else {
      tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0).style("position", "absolute");
      tooltip.style("opacity", 1).style("left", event.pageX - this.dataPointSize * 0.77 + "px").style("top", event.pageY - this.dataPointSize * 2.4 + "px");
    }
    var value = observation.observationvalue != null ? observation.observationvalue : ""
    if (value === true) { value = "Yes" } else if (value === false) { value = "No" };
    //
    const units = observation.units != null ? observation.units : "";
    var linkText;
    if (this.appService.appConfig.appsettings.openGuidModalOnClickFromChart && name == "earlywarningscore" && observationData.earlywarningscore.observationvalue != 'R') {
      dataWasTapped = true;
      this.launchPopover(observationevent_id, name, value, units, linkText, observation.guidance, scale);
    }
    else if (name == "earlywarningscore" && observationData.earlywarningscore && observationData.earlywarningscore.observationvalue == 'R') {
      value = "Patient refused <br> recording of observations"
      linkText = ""
    }
    else if (name == "earlywarningscore") {
      linkText = "guidance";
    }
    else if (observation.hasbeenammended) {
      linkText = "history";
    }
    else if (this.isValueAmendable) {
      linkText = "amend"
    }
    else {
      linkText = "";
    }

    tooltip.html(value + " " + units + "<div><a id='toolTipButton' href='#'>" + linkText + "</a></div>");
    tooltip.select("#toolTipButton")
      .on("click", () => {
        dataWasTapped = true;
        this.launchPopover(observationevent_id, name, value, units, linkText, observation.guidance, scale);
        //this.appService.logToConsole("label was clicked");
        return;
      });
  }

  launchPopover(observationevent_id, name, observationvalue, units, linkText, ewsguidance, scale) {
    if (name == "earlywarningscore") {
   this.loadobservations({ score: observationvalue, observationevent_id: observationevent_id, guidance: ewsguidance, ewsScaleType: scale })
  return;
    }
    else {
      if (linkText == "amend") {
        if (this.loadedScale.indexOf("NEWS2") != -1) {
          this.subjects.openObsForm.next("Amend Observations");
          this.subjects.amendObs.next(observationevent_id);
        }
        else {
          this.subjects.openObsPEWSForm.next("Amend Observations");
          this.subjects.amendPEWSObs.next(observationevent_id);
        }

      }
      else
        this.subjects.openPopover.next({
          "observationevent_id": observationevent_id,
          "name": name,
          "value": observationvalue,
          "units": units
        });
    }
  }

  cleanUpTooltips() {
    var activeToolTip = d3.selectAll('.tooltip');
    if (!dataWasTapped) {
      // this.appService.logToConsole("body - dataWasNOTtapped")
      d3.selectAll('.tooltip').remove();
    } else if (activeToolTip.size() > 1) {
      d3.select('.tooltip').remove();
      dataWasTapped = false;
    } else {
      dataWasTapped = false;
    };

  }


  appendGraphCellBackground(chartSvg: any, x: number, y: number, width: number, height: number, classname: string) {

    chartSvg.append("rect")
      .attr("class", classname)
      .attr("x", x)
      .attr("y", y)
      .attr("width", width)
      .attr("height", height);

  }

  isPartialScore(observation: any) {

    if (observation.respirations && observation.respirations.observationvalue) {
      // respirations has been recorded
    }
    else {
      return true
    }

    if (observation.oxygensaturations && observation.oxygensaturations.observationvalue) {
      // oxygensaturations has been recorded
    }
    else {
      return true
    }

    if (observation.isonoxygen && (observation.isonoxygen.observationvalue == true || observation.isonoxygen.observationvalue == false)) {
      // isonoxygen has been recorded
    }
    else {
      return true
    }

    if (observation.diastolicbloodpressure && observation.diastolicbloodpressure.observationvalue) {
      // diastolicbloodpressure has been recorded
    }
    else {
      return true
    }
    if (observation.systolicbloodpressure && observation.systolicbloodpressure.observationvalue) {
      // systolicbloodpressure has been recorded
    }
    else {
      return true
    }

    if (observation.consciousness && observation.consciousness.observationvalue && observation.consciousness.observationvalue.trim() != "") {
      // consciousness has been recorded
    }
    else {
      return true
    }

    if (observation.pulse && observation.pulse.observationvalue) {
      // pulse has been recorded
    }
    else {
      return true
    }

    if (observation.temperature && observation.temperature.observationvalue) {
      // temperature has been recorded
    }
    else {
      return true
    }
    return false


  }

  appendText(chartSvg: any, x: number, y: number, dx: number, dy: number, classname: string, text: any) {

    chartSvg.append("text")
      .attr("class", classname)
      .attr("x", x)
      .attr("y", y)
      .attr("dx", dx)
      .attr("dy", dy)
      .text(text)
      .style("text-anchor", "start");

  }
  showPopupinfo(infotype: string) {
    this.subjects.OpenInfo.next(infotype)
  }

  getYindexForValues(decimalValue: number | null, secondValue: number | null): { firstValue: { value: number, label: string } | null; secondValue: { value: number, label: string } | null } {



    let result = {
      firstValue: null as { value: number, label: string } | null,
      secondValue: null as { value: number, label: string } | null,
    };

    // Handle the first parameter (decimalValue) if not null
    if (decimalValue !== null) {
      if (decimalValue < 0.01) result.firstValue = { value: 2, label: "X" };
      else if (decimalValue >= 0.01 && decimalValue <= 0.09) result.firstValue = { value: 3, label: "X" };
      else if (decimalValue >= 0.1 && decimalValue <= 0.99) result.firstValue = { value: 4, label: "X" };
      else if (decimalValue >= 1 && decimalValue <= 1.99) result.firstValue = { value: 5, label: "X" };
      else if (decimalValue >= 2 && decimalValue <= 3.99) result.firstValue = { value: 6, label: "X" };
      else if (decimalValue >= 4 && decimalValue <= 5.99) result.firstValue = { value: 7, label: "X" };
      else if (decimalValue >= 6 && decimalValue <= 7.99) result.firstValue = { value: 8, label: "X" };
      else if (decimalValue >= 8 && decimalValue <= 9.99) result.firstValue = { value: 9, label: "X" };
      else if (decimalValue >= 10 && decimalValue <= 14.99) result.firstValue = { value: 10, label: "X" };
      else if (decimalValue >= 15) result.firstValue = { value: 11, label: "X" };
    }

    // Handle the second parameter (secondValue) if not null
    if (secondValue !== null) {
      if (secondValue < 21) result.secondValue = { value: 2, label: "Y" };
      else if (secondValue >= 21 && secondValue <= 23) result.secondValue = { value: 3, label: "Y" };
      else if (secondValue >= 24 && secondValue <= 27) result.secondValue = { value: 4, label: "Y" };
      else if (secondValue >= 28 && secondValue <= 29) result.secondValue = { value: 5, label: "Y" };
      else if (secondValue >= 30 && secondValue <= 39) result.secondValue = { value: 6, label: "Y" };
      else if (secondValue >= 40 && secondValue <= 49) result.secondValue = { value: 7, label: "Y" };
      else if (secondValue >= 50 && secondValue <= 59) result.secondValue = { value: 8, label: "Y" };
      else if (secondValue >= 60 && secondValue <= 69) result.secondValue = { value: 9, label: "Y" };
      else if (secondValue >= 70 && secondValue <= 79) result.secondValue = { value: 10, label: "Y" };
      else if (secondValue >= 80 && secondValue <= 89) result.secondValue = { value: 11, label: "Y" };
      else if (secondValue >= 90) result.secondValue = { value: 12, label: "Y" };
    }

    return result;
  }

  getYindexForValuesforTemparater(decimalValue: number | null){



    let result =0
    // Handle the first parameter (decimalValue) if not null
    if (decimalValue !== null) {
      if (decimalValue <= 34.5) result =0
      else if (decimalValue >= 34.6 && decimalValue <= 35.0) result=1;
      else if (decimalValue >= 35.1 && decimalValue <= 35.5) result=2;
      else if (decimalValue >= 35.6 && decimalValue <= 36.0) result=3;

      else if (decimalValue >= 36.1 && decimalValue <= 36.5) result=4;

      else if (decimalValue >= 34.6 && decimalValue <= 37.0) result=5;

      else if (decimalValue >= 37.1 && decimalValue <= 37.5) result=6;

      else if (decimalValue >= 37.6 && decimalValue <= 37.9) result=7;
      else if (decimalValue >= 38.0 && decimalValue <= 38.5) result=8;
      else if (decimalValue >= 38.6 && decimalValue <= 39.0) result=9;
 

      else if (decimalValue >= 39.1) result=10;
    }



    return result;
  }

  getYindexForValuesforTemperature(decimalValue: number | null){



    let result =0
    // Handle the first parameter (decimalValue) if not null
    if (decimalValue !== null) {
      if (decimalValue <= 34.5) result =0
      else if (decimalValue >= 34.6 && decimalValue <= 35.0) result=1;
      else if (decimalValue >= 35.1 && decimalValue <= 35.5) result=2;
      else if (decimalValue >= 35.6 && decimalValue <= 36.0) result=3;

      else if (decimalValue >= 36.1 && decimalValue <= 36.5) result=4;

      else if (decimalValue >= 34.6 && decimalValue <= 37.0) result=5;

      else if (decimalValue >= 37.1 && decimalValue <= 37.5) result=6;

      else if (decimalValue >= 37.6 && decimalValue <= 37.9) result=7;
      else if (decimalValue >= 38.0 && decimalValue <= 38.5) result=8;
      else if (decimalValue >= 38.6 && decimalValue <= 39.0) result=9;
 

      else if (decimalValue >= 39.1) result=10;
    }



    return result;
  }
    loadobservations(event) {
 
  
    if (this.loadedScale.includes("PEWS")) {
   
        this.subscriptions.add(this.apiRequest.getRequest(`${this.appService.baseURI}/GetListByAttribute?synapsenamespace=core&synapseentityname=observation&synapseattributename=observationevent_id&attributevalue=${event.observationevent_id}`)
      .subscribe((response) => {
        event.observations = JSON.parse(response);
        
        this.appService.openSelectedGuidance=this.appService.selectedChart
        this.subjects.openPEWSGuidance.next(event);

      }));
       
    }
    else{
      this.appService.openSelectedGuidance=this.appService.selectedChart
      this.subjects.openGuidance.next(event);
    }
    

   
  }



}
