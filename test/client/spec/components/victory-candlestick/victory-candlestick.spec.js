/**
 * Client tests
 */
/*eslint-disable max-nested-callbacks */
/* global sinon */
/* eslint no-unused-expressions: 0 */
import React from "react";
import { shallow, mount } from "enzyme";
import { omit, range } from "lodash";
import VictoryCandlestick from "src/components/victory-candlestick/victory-candlestick";
import Candle from "src/components/victory-candlestick/candle";
import { VictoryLabel } from "victory-core";

class MyCandle extends React.Component {

  render() { }
}

const dataSet = [{x: 5, open: 10, close: 20, high: 25, low: 5}];

describe("components/victory-candlestick", () => {
  describe("default component rendering", () => {
    it("renders an svg with the correct width and height", () => {
      const wrapper = mount(
        <VictoryCandlestick data={dataSet}/>
      );
      const svg = wrapper.find("svg");
      expect(svg.prop("style").width).to.equal("100%");
      expect(svg.prop("style").height).to.equal("auto");
    });

    it("renders an svg with the correct viewBox", () => {
      const wrapper = mount(
        <VictoryCandlestick data={dataSet}/>
      );
      const svg = wrapper.find("svg");
      const viewBoxValue =
        `0 0 ${VictoryCandlestick.defaultProps.width} ${VictoryCandlestick.defaultProps.height}`;
      expect(svg.prop("viewBox")).to.equal(viewBoxValue);
    });

    it("renders 51 points", () => {
      const wrapper = shallow(
        <VictoryCandlestick/>
      );
      const points = wrapper.find(Candle);
      expect(points.length).to.equal(51);
    });
  });

  describe("rendering data", () => {
    it("renders injected points for {x, y} shaped data (default)", () => {
      const data = range(10).map((i) => ({x: i, y: i}));
      const wrapper = shallow(
        <VictoryCandlestick data={data} dataComponent={<MyCandle />} />
      );

      const points = wrapper.find(MyCandle);
      expect(points.length).to.equal(10);
    });

    it("renders points for {x, y} shaped data (default)", () => {
      const data = range(10).map((i) => ({x: i, y: i}));
      const wrapper = shallow(
        <VictoryCandlestick data={data}/>
      );
      const points = wrapper.find(Candle);
      expect(points.length).to.equal(10);
    });

    it("renders points for array-shaped data", () => {
      const data = range(20).map((i) => [i, i]);
      const wrapper = shallow(
        <VictoryCandlestick data={data} x={0} y={1}/>
      );
      const points = wrapper.find(Candle);
      expect(points.length).to.equal(20);
    });

    it("renders points for deeply-nested data", () => {
      const data = range(40).map((i) => ({a: {b: [{x: i, y: i}]}}));
      const wrapper = shallow(
        <VictoryCandlestick data={data} x="a.b[0].x" y="a.b[0].y"/>
      );
      const points = wrapper.find(Candle);
      expect(points.length).to.equal(40);
    });

    it("renders data values with null accessor", () => {
      const data = range(30);
      const wrapper = shallow(
        <VictoryCandlestick data={data} x={null} y={null}/>
      );
      const points = wrapper.find(Candle);
      expect(points.length).to.equal(30);
    });
  });

  describe("event handling", () => {
    it("attaches an event to data", () => {
      const clickHandler = sinon.spy();
      const wrapper = mount(
        <VictoryCandlestick
          events={[{
            target: "data",
            eventHandlers: {onClick: clickHandler}
          }]}
        />
      );
      const Data = wrapper.find(Candle);
      Data.forEach((node, index) => {
        const initialProps = Data.at(index).props();
        node.simulate("click");
        expect(clickHandler.called).to.equal(true);
        // the first argument is the standard evt object
        expect(omit(clickHandler.args[index][1], ["events", "key"]))
          .to.eql(omit(initialProps, ["events", "key"]));
        expect(`${clickHandler.args[index][2]}`).to.eql(`${index}`);
      });
    });

    it("attaches an event to a label", () => {
      const clickHandler = sinon.spy();
      const data = [
        {eventKey: 0, x: 0, open: 0, close: 0, high: 0, low: 0, label: "0"},
        {eventKey: 1, x: 1, open: 1, close: 1, high: 1, low: 1, label: "1"},
        {eventKey: 2, x: 2, open: 2, close: 2, high: 2, low: 2, label: "2"}
      ];
      const wrapper = mount(
        <VictoryCandlestick
          data={data}
          events={[{
            target: "labels",
            eventHandlers: {onClick: clickHandler}
          }]}
        />
      );
      const Labels = wrapper.find(VictoryLabel);
      Labels.forEach((node, index) => {
        node.childAt(0).simulate("click");
        expect(clickHandler).called;
        // the first argument is the standard evt object
        expect(clickHandler.args[index][1].datum).to.eql(data[index]);
        expect(`${clickHandler.args[index][2]}`).to.eql(`${index}`);
      });
    });
  });
});
