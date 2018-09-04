import * as React from "react";
import { IHyperpartitionInfo, IClassifierInfo } from "service/dataService"
import { getColor } from "helper";


// import { IDatarun } from "types";
const d3 = require("d3");
export interface IProps {
    hyperpartitions: IHyperpartitionInfo[],
    // datarun: IDatarun,
    selectedMethod: string,
    classifiers: IClassifierInfo[]
}
export interface IState {

}
export default class HyperPartitions extends React.Component<IProps, IState>{
    public hyperpartitionBox = {
        height: 20,
        gap: 8,
        width: 160
    }
    numPerRow = 14
    public renderD3(hpsInfo: Array<any>, maxLen: number, selectedMethod: string) {
            // let num_all_hp = hpsInfo.length
            hpsInfo = hpsInfo.filter(d => d.scores.length > 0)
            let { height, width, gap } = this.hyperpartitionBox

            // let g = d3.select('.HyperPartitions')
            //     .append('g')
            //     .attr('class', `HyperPartitions_${selectedMethod}`)
            // // let x = d3.scaleLinear()
            // //         .rangeRound([0, width]);

            let trans = d3.transition()
                    .duration(1000)
                    .ease(d3.easeLinear);

            let x = d3.scaleBand()
                .rangeRound([0, width])
                .paddingInner(0.05);

            let y = d3.scaleLinear()
                .rangeRound([height, 0]);
            x.domain(Array.from(Array(maxLen).keys()))
            // x.domain([0,10])
            y.domain([0, 1]);


            let pos = [[gap, height]]
            for (let i = 0; i < hpsInfo.length; i++) {
                let currentPos = [0, 0]
                if (hpsInfo[i].method == selectedMethod) {
                    currentPos = [pos[i][0], pos[i][1] + (2 * height + gap)]
                } else {
                    currentPos = [pos[i][0], pos[i][1] + (2 * gap)]
                }
                if (pos[i][1] > window.innerHeight * 0.8) {
                    currentPos = [pos[i][0] + width * 1.5, 2*(height+gap)]
                }
                pos.push(currentPos)
            }

            //enter
            let hps = d3
                .select('g.HyperPartitions')
                .selectAll(`g.hpGroup`)
                .data(hpsInfo)
            let hpGroup = hps
                .enter()
                .append("g")
                .attr('class', 'hpGroup')
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${pos[i + 1][0]},${pos[i + 1][1]})`
                    }
                )

            hps.filter((d: any) => d.method == selectedMethod)
                .selectAll('.hpBar')
                .data((d: any) => d.scores)
                .enter().append("rect")
                .attr("class", "hpBar")
                .style('fill', function (d: any) {
                    return getColor(selectedMethod)
                })
                .attr("x", (d: any, i: number) => x(0))
                .attr("y", (d: any) => 0 )
                .attr("width", 0)
                .attr("height", 0)
                .transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d)))


            // hpGroup.append('g')
            // .attr('transform', (d:any)=>`translate(${width*d.scores.length/maxLen}, 0)`)
            // .attr('class', 'axis')
            // .call(d3.axisRight(y))

            let strokeWidth = 1

            hpGroup.append('rect')
                .attr('class', "out_hyperPartition")
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
                .style('stroke', 'gray')
                .style('stroke-width', strokeWidth)



            // hpGroup.append('rect')
            // .attr('class', "bg_hyperPartition")
            // .attr('height', height)
            // .attr('y', height)
            // .attr('width', (d:any)=>width*d.scores.length/maxLen )
            // .style('fill', (d:any)=>getColor(d.method))
            // .style('stroke', 'white')
            // .style('stroke-width', 2)

            hps.filter((d: any) => d.method == selectedMethod)
                .append('text')
                .attr('class', "num_cls")
                .attr('x', (d: any) => width * d.scores.length / maxLen - 2)
                .attr('y', 0)
                .text((d: any) => d.scores.length)
                .attr('text-anchor', 'end')


            hps.filter((d: any) => d.method == selectedMethod)
                .append('text')
                .attr('class', "best_score")
                // .attr('x', (d:any)=>width*d.scores.length/maxLen)
                .attr('x', width + 2)
                .attr('y', 0)
                .text((d: any) => d.bestScore >= 0 ? d.bestScore.toFixed(3) : '')

            hps.filter((d: any) => d.method == selectedMethod)
                .append('g')
                .attr('class', 'hp_name')
                .attr('transform', `translate(${0}, ${0})`)
                .append('foreignObject')
                .attr('width', width)
                .attr('height', height)
                .append('xhtml:div')
                .html((d: any) =>
                    `<div
                style='text-overflow: ellipsis;
                width: ${width}px;
                height: ${height}px;
                overflow:hidden;
                white-space:nowrap';
                padding: 2px;
            >
                ${d.hyperpartition_string}
            </div>`
                )

            //update
            hps.transition(trans)
                .attr("transform",
                    (d: any, i: number) => {
                        return `translate(${pos[i + 1][0]},${pos[i + 1][1]})`

                })



            hps.filter((d: any) => d.method != selectedMethod)
                .selectAll('.hpBar')
                .transition(trans)
                .attr('width', 0)
                .attr('height', 0)
                .attr('x', x(0))
                .attr('y', height)
                .remove()

            hps.filter((d: any) => d.method == selectedMethod)
                .selectAll('.hpBar')
                .data((d: any) => d.scores)
                .enter().append("rect")
                .attr("class", "hpBar")
                .style('fill', function (d: any) {
                    return getColor(selectedMethod)
                })
                .attr("x", (d: any, i: number) => x(0))
                .attr("y", (d: any) => 0 )
                .attr("width", 0)
                .attr("height", 0)
                .transition(trans)
                .attr("x", (d: any, i: number) => x(i))
                .attr("y", (d: any) => y(d) - height)
                .attr("width", x.bandwidth())
                .attr("height", (d: any) => (height - y(d)))

            hps.selectAll('.out_hyperPartition')
                .transition(trans)
                .attr('height', (d: any) => d.method == selectedMethod ? (height + 2 * strokeWidth) : gap)
                .attr('y', (d: any) => d.method == selectedMethod ? (-strokeWidth - height) : (gap))
                .attr('x', -strokeWidth)
                .attr('width', (d: any) => d.method == selectedMethod ? (width + 2 * strokeWidth) : gap)
                .style('fill', (d: any) => d.method == selectedMethod ? 'none' : getColor(d.method))
                .style('stroke', 'gray')
                .style('stroke-width', strokeWidth)

            hps.filter((d: any) => d.method == selectedMethod)
                .append('text')
                .attr('class', "num_cls")
                .attr('x', (d: any) => width * d.scores.length / maxLen - 2)
                .attr('y', 0)
                .text((d: any) => d.scores.length)
                .attr('text-anchor', 'end')
                .attr('opacity', 1e-6)
                .transition(trans)
                .attr('opacity', 1)
            hps.filter((d: any) => d.method == selectedMethod)
                .append('text')
                .attr('class', "best_score")
                // .attr('x', (d:any)=>width*d.scores.length/maxLen)
                .attr('x', width + 2)
                .attr('y', 0)
                .text((d: any) => d.bestScore >= 0 ? d.bestScore.toFixed(3) : '')
                .attr('opacity', 1e-6)
                .transition(trans)
                .attr('opacity', 1)
            hps.filter((d: any) => d.method == selectedMethod)
                .append('g')
                .attr('class', 'hp_name')
                .attr('transform', `translate(${0}, ${0})`)
                .append('foreignObject')
                .attr('width', width)
                .attr('height', height)
                .append('xhtml:div')
                .html((d: any) =>
                    `<div
                style='text-overflow: ellipsis;
                width: ${width}px;
                height: ${height}px;
                overflow:hidden;
                white-space:nowrap';
                padding: 2px;
            >
                ${d.hyperpartition_string}
            </div>`
                ).attr('opacity', 1e-6)
                .transition(trans)
                .attr('opacity', 1)

            hps.filter((d: any) => d.method != selectedMethod)
                .selectAll('text')
                .transition(trans)
                .attr('opacity', 1e-6)
                .remove()
            hps.filter((d: any) => d.method != selectedMethod)
                .selectAll('g.hp_name')
                .transition(trans)
                .attr('opacity', 1e-6)
                .remove()

            // exit()
            hps.exit()
            .transition(trans)
            .attr('opacity', 1e-6)
            .remove()


    }


    public sortHpByperformance(props: IProps) {
        let { hyperpartitions: hps, classifiers: cls, selectedMethod } = props
        // cls = cls.filter(d=>d.method==selectedMethod)
        // hps = hps.filter(d=>d.method==selectedMethod)
        let hpsInfo = hps.map(hp => {
            let filteredCls = cls
                .filter(
                    cls => cls.hyperpartition_id == hp.id
                )
            let scores = filteredCls.map(
                d => d.cv_metric
            ).sort((a, b) => (a - b))
            return {
                ...hp,
                bestScore: Math.max(...scores),
                scores
            }
        })
        hpsInfo.sort((a, b) => (b.bestScore - a.bestScore))
        let maxLen = Math.max(...hpsInfo.map(d => d.scores.length))
        if (maxLen < 0) maxLen = 0


        // let filterHps = hps.filter(d => d.method == selectedMethod)
        // let filterHpsInfo = hpsInfo.filter(d => d.method == selectedMethod)

        return { hps, hpsInfo, maxLen, selectedMethod }
    }
    componentDidMount() {
        let { maxLen, hpsInfo, selectedMethod } = this.sortHpByperformance(this.props)
        if(hpsInfo.length>0){
            this.renderD3(hpsInfo, maxLen, selectedMethod)
        }
    }
    shouldComponentUpdate(nextProps: IProps, nextStates: IState) {
        if (this.props != nextProps || this.props.hyperpartitions.length == 0) {
            let { maxLen, hpsInfo, selectedMethod } = this.sortHpByperformance(nextProps)

            // d3.select(`.HyperPartitions_${this.props.selectedMethod}`).remove()

            this.renderD3(hpsInfo, maxLen, selectedMethod)
        }
        return false
    }
    // componentWillUpdate(){
    //     this.renderD3()
    // }
    render() {

        // let rectWidth = Math.max(
        //     ...hpsInfo.map(
        //         d=>d.hyperpartition_string.length*fontSize
        //     )
        // )
        return <g className={`HyperPartitions`} />
    }
}
