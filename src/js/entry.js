// document.getElementsByTagName('body')[0].style.zoom=2

// if (screen.width >= 1440){
// }else{
//     document.getElementsByTagName('body')[0].style.zoom=0.67
// }

$(function(){
    var player = $('#player')[0];
    player.play()
    //svg
    const svg = d3.select('svg');
    const margin = {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    };
    const width = svg.attr('width') - margin.left - margin.right;
    const height = svg.attr('height') - margin.top - margin.bottom;
    const centerX = width/2; const centerY = height/2;

    //数据提取所需要的所有数据
    let smoke = [];
    let fat = [];
    let sport = [];
    let hypertension = [];
    let hyperglycemia = [];
    let countriesEn = [];

    let smoke_m = [], smoke_f = [], fat_m = [],fat_f = [],sport_m = [], sport_f = [],
        hypertension_m = [], hypertension_f = [], hyperglycemia_m = [], hyperglycemia_f=[];
    let continent = [];
    let area = [];
    let gdp = [];
    let population = [];
    let deathRate = [];
    

    d3.csv("datall.csv",function(error,csvdata){
        if(error){
            console.log('load csv error');
        }
        $.each(csvdata, function(index, ele){
            continent.push(ele['continent']);
            countriesEn.push(ele['country']);
            area.push(ele['area'])
            smoke.push(ele['smoke']);
            fat.push(ele['fat']);
            sport.push(ele['sport']);
            hypertension.push(ele['hypertension']);
            hyperglycemia.push(ele['hyperglycemia']);
            gdp.push(ele['gdp']);
            population.push(ele['population']);
            deathRate.push(ele['deathRate'])
            smoke_m.push(ele['smoke_m'])
            smoke_f.push(ele['smoke_f'])
            fat_m.push(ele['fat_m'])
            fat_f.push(ele['fat_f'])
            sport_m.push(ele['sport_m'])
            sport_f.push(ele['sport_f'])
            hypertension_m.push(ele['hypertension_m'])
            hypertension_f.push(ele['hypertension_f'])
            hyperglycemia_m.push(ele['hyperglycemia_m'])
            hyperglycemia_f.push(ele['hyperglycemia_f'])
        })

        //数据清洗
        preprocess(smoke);
        preprocess(fat);
        preprocess(sport);
        preprocess(hypertension);
        preprocess(hyperglycemia);
        preprocess(hyperglycemia_m);
        preprocess(hyperglycemia_f);
        preprocess(smoke_m);
        preprocess(smoke_f);
        preprocess(sport_f);
        preprocess(sport_m);
        preprocess(hypertension_f);
        preprocess(hypertension_m);
        preprocess(fat_f);
        preprocess(fat_m);
        //绘制图形
        setup();
    });



    let container = null;
    let growingTree = null;
    let factorChart = null;
    let radius = [];
    let interval = null;

    let currentCountryIndex = 0;
    let timer = null;
    let highlight = false;//控制单次高亮
    let highlightIndex = null;

    let recCol = ['rgb(221,186,186)','rgb(219,169,169)','rgb(214,149,148)']
    let recColorScale=[]
    let deathRateMax;//min=0.354

    //对无效数据做必要的剔除
    function preprocess(arr) {
        for(var i in arr){
            arr[i] = parseFloat(arr[i]);
            if(Number.isNaN(arr[i]) || arr[i] === "")arr[i] = 0;
        }
    }


    function setup() {
        //坐标
        container = svg.append("g")
            .attr('class', 'map')
            .attr("transform","translate("+width/2 +"," +height/2 +")")
            .on('mouseenter', triggerSelect)
        growingTree = svg.append("g")
            .attr('class', 'tree')
            
        allPaint();
    }

    function allPaint() {
        deathRateMax = d3.max(deathRate)
        recColorScale = [(deathRateMax - (deathRateMax-0.354)/3), (deathRateMax - (deathRateMax-0.354)/3*2)];//inormal
        interval = 360/smoke.length;

        const allDeath = container.append('g')
            .attr('class','allDeath')
            .classed('rectGroup', true)
            .selectAll('polygon').data(deathRate).enter()
            .append("polygon")
            .attr('points', function(d, i){
                    return '200,2.5 '+ (200 + Math.pow(1.5, d*10) * 5)+','+3.2
                        + ' '+ (200 + Math.pow(1.5, d*10) *5)+','+'-3.2 ' + '200,-2.5'
                }
            )
            .attr('transform',function (d, i) {
                return "rotate("+ i*interval + ")";
            })
            .style('fill', function(d,i){
                if (d > recColorScale[0]) return recCol[2];
                else if(d > recColorScale[1])return recCol[1];
                else return recCol[0]
            })

        let countryScale = [42,47,54,16,23,12];

        let pie = d3.pie()
            .startAngle(Math.PI/2-0.02)
            .endAngle(Math.PI*4)
            .padAngle(0.02)
            .sort(null)
            .sortValues(null)
        let innerR = 186
        let outR = 190
        let arc_generator = d3.arc()
            .innerRadius(innerR)
            .outerRadius(outR)
            // .cornerRadius(10)
        let pieData = pie(countryScale)
        
        let g = container.append('g')
            .attr('class', 'scaleCircle')
            .selectAll("g")
            .data(pieData)
            .enter()
            .append("g")
        g.append("path")
            .attr('stroke', 'none')
            .attr("d", d => arc_generator(d))
            .attr("fill", 'rgb(221,123,123)')


        //柱状图底图
        svg.append('rect')
            .attr('x', 170)
            .attr('y', 452)
            .attr('width', 250)
            .attr('height', 15)
            .style('fill', 'rgb(222,189,189)')
        svg.append('rect')
            .attr('x', 170)
            .attr('y', 498)
            .attr('width', 250)
            .attr('height', 15)
            .style('fill', 'rgb(222,189,189)')
        svg.append('rect')
            .attr('x', 170)
            .attr('y', 524)
            .attr('width', 250)
            .attr('height', 15)
            .style('fill', 'rgb(222,189,189)')
        svg.append('rect')
            .attr('x', 170)
            .attr('y', 552)
            .attr('width', 250)
            .attr('height', 15)
            .style('fill', 'rgb(222,189,189)')
        svg.append('rect')
            .attr('x', 170)
            .attr('y', 577)
            .attr('width', 250)
            .attr('height', 15)
            .style('fill', 'rgb(222,189,189)')


        //高血压 
        svg.append('rect')
            .attr('class', 'hypertensionBarm')
            .attr('x', 170)
            .attr('y', 452)
            .attr('width', hypertension[0] *hypertension_m[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(182,142,158)')
        svg.append('rect')
            .attr('class', 'hypertensionBarf')
            .attr('x', 170 + hypertension[0] *hypertension_m[0] * 4)
            .attr('y', 452)
            .attr('width', hypertension[0] *hypertension_f[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(221,141,141)')


        //烟草
        svg.append('rect')
            .attr('class', 'smokeBarm')
            .attr('x', 170)
            .attr('y', 498)
            .attr('width', smoke[0] *smoke_m[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(182,142,158)')
        svg.append('rect')
            .attr('class', 'smokeBarf')
            .attr('x', 170 + smoke[0] *smoke_m[0] * 4)
            .attr('y', 498)
            .attr('width', smoke[0] *smoke_f[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(221,141,141)')


        //糖尿病
        svg.append('rect')
            .attr('class', 'hyperglycemiaBarm')
            .attr('x', 170)
            .attr('y', 524)
            .attr('width', hyperglycemia[0] *hyperglycemia_m[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(182,142,158)')
        svg.append('rect')
            .attr('class', 'hyperglycemiaBarf')
            .attr('x', 170 + hyperglycemia[0] *hyperglycemia_m[0] * 4)
            .attr('y', 524)
            .attr('width', hyperglycemia[0] *hyperglycemia_f[0] * 4)
            .attr('height', 15)
            .style('fill', 'rgb(221,141,141)')


        //运动不足
        svg.append('rect')
                .attr('class', 'sportBarm')
                .attr('x', 170)
                .attr('y', 552)
                .attr('width', sport[0] *sport_m[0] * 4)
                .attr('height', 15)
                .style('fill', 'rgb(182,142,158)')
        svg.append('rect')
                .attr('class', 'sportBarf')
                .attr('x', 170 + sport[0] *sport_m[0] * 4)
                .attr('y', 552)
                .attr('width', sport[0] *sport_f[0] * 4)
                .attr('height', 15)
                .style('fill', 'rgb(221,141,141)')

        //肥胖
        svg.append('rect')
                .attr('class', 'fatBarm')
                .attr('x', 170)
                .attr('y', 577)
                .attr('width', fat[0] *fat_m[0] * 4)
                .attr('height', 15)
                .style('fill', 'rgb(182,142,158)')
        svg.append('rect')
                .attr('class', 'fatBarf')
                .attr('x', 170 + fat[0] *fat_m[0] * 4)
                .attr('y', 577)
                .attr('width', fat[0] *fat_f[0] * 4)
                .attr('height', 15)
                .style('fill', 'rgb(221,141,141)')


        //平均值标注
        svg.append('rect')
            .attr('x', 170 + 22.3*4)
            .attr('y', 450)
            .attr('width', 3)
            .attr('height', 19)
            .style('fill', 'rgba(211,79,79,0.5)')
        svg.append('rect')
            .attr('x', 170 + 19.2*4)
            .attr('y', 496)
            .attr('width', 3)
            .attr('height', 19)
            .style('fill', 'rgba(211,79,79,0.5)') 
        svg.append('rect')
            .attr('x', 170 + 8.5*4)
            .attr('y', 522)
            .attr('width', 3)
            .attr('height', 19)
            .style('fill', 'rgba(211,79,79,0.5)')
        svg.append('rect')
            .attr('x', 170 + 27.5*4)
            .attr('y', 550)
            .attr('width', 3)
            .attr('height', 19)
            .style('fill', 'rgba(211,79,79,0.5)')
        svg.append('rect')
            .attr('x', 170 + 13.2*4)
            .attr('y', 575)
            .attr('width', 3)
            .attr('height', 19)
            .style('fill', 'rgba(211,79,79,0.5)') 

        //上一层文字（最顶层）
        svg.append('text')
            .attr('class', 'hypertensionBartext')
            .attr('x',''+(172 + hypertension[0] * 4))
            .attr('y',465)
            .text(hypertension[0]+'%')
            .style('color', '#845959')
            .style('font-size', 12)
        svg.append('text')
            .attr('class', 'smokeBartext')
            .attr('x',''+(172 + smoke[0] * 4))
            .attr('y',511)
            .text(smoke[0]+'%')
            .style('color', '#845959')
            .style('font-size', 12)
        svg.append('text')
            .attr('class', 'hyperglycemiaBartext')
            .attr('x',''+(172 + hyperglycemia[0] * 4))
            .attr('y',536)
            .text(hyperglycemia[0]+'%')
            .style('color', '#845959')
            .style('font-size', 12)
        svg.append('text')
                .attr('class', 'sportBartext')
                .attr('x',''+(172 + sport[0] * 4))
                .attr('y',565)
                .text(sport[0]+'%')
                .style('color', '#845959')
                .style('font-size', 12)
        svg.append('text')
            .attr('class', 'fatBartext')
            .attr('x',''+(172 + fat[0] * 4))
            .attr('y',590)
            .text(fat[0]+'%')
            .style('color', '#845959')
            .style('font-size', 12)
    }

    function triggerSelect(){
        clearInterval(timer);
        let svgLeft = document.querySelector('#mysvg').getBoundingClientRect().left
        let svgTop = document.querySelector('#mysvg').getBoundingClientRect().top
        d3.select('.map').on('mousemove', function(Event){
            let index = -1;
            let deltx = event.clientX - svgLeft - width/2;
            let delty = event.clientY - svgTop - height/2;
            let angle = Math.atan(delty / deltx) * 180 / Math.PI;
            angle = (function(){
                if (deltx < 0)return 180 + angle;
                else if(delty > 0)return angle;
                else return 360 + angle;
            })(angle)
            let ind = Math.round(angle/interval)
            if(angle > ind*interval-1 && angle < ind*interval+1){
                index = ind;
                if(highlight == false){
                    pop(index);
                    highlight = true;
                    highlightIndex = index;
                    
                }
            }else{
                if(highlight){
                    highlight = false;
                    console.log(highlightIndex)
                    popback(highlightIndex);
                }
            }
        }).on('mouseleave',function(){
            if(highlight){
                highlight = false;
                popback(highlightIndex);
                scrollAuto();
            }
        })

    }

    function pop(index ,callback){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);
        paintTree(index);
        updateTable(index);
        updateMap(index);
        
        currentRect.transition()
            .duration(500)
            .style('fill', 'rgb(221,110,110)')


        if(callback && callback == true){
            setTimeout(() => {
                popback(index)
            }, 2500);

        }
    }

    function paintTree(index){
        
        growingTree.attr("transform",
            "translate("+width/2+"," +height/2 +")"
            +" rotate(" + index * interval + ")"
            )


        const pieCol = ['rgb(140,179,221)', 'rgb(232,170,170)']
        
        let startX = (200 + Math.pow(1.5, deathRate[index]*10) * 5),
            startY = 0;

        //高血糖：中间
        if(hyperglycemia[index] != 0){
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2',startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x1', startX)
                .attr('x2', startX + hyperglycemia[index]*4)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [hyperglycemia_m[index], hyperglycemia_f[index]];
            let pie = d3.pie()
            let innerR = 0
            let outR = Math.log(hyperglycemia[index])*3
            let arc_generator = d3.arc()
                .innerRadius(innerR)
                .outerRadius(outR)
            let pieData = pie(dataset)
         
            let g = growingTree.append('g')
                .attr('transform', 
                'translate(' + (startX + hyperglycemia[index]*4)
                + ',0)')
                .attr('class', 'arcs')
                .selectAll("g")
                .data(pieData)
                .enter()
                .append("g")
            g.append("path")
                .style('opactiy', 0)
                .transition()
                .delay(700)
                .attr('stroke', 'none')
                .attr("d", d => arc_generator(d))
                .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX+ 8.5*4)
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }

        var path = d3.path();

        //高血压：第1条
        startY = -2;
        if(hypertension[index] != 0){
            endX = startX + hypertension[index]*4*Math.cos(-40/180 * Math.PI);
            endY = hypertension[index]*4*Math.sin(-40/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1',startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [hypertension_m[index], hypertension_f[index]];
            let pie = d3.pie()
            let innerR = 0
            let outR = Math.log(hypertension[index])*3
            let arc_generator = d3.arc()
                .innerRadius(innerR)
                .outerRadius(outR)
            let pieData = pie(dataset)
            
            let g = growingTree.append('g')
                .attr('transform', 
                'translate(' + endX + ","  + endY + ')')
                .attr('class', 'arcs')
                .selectAll("g")
                .data(pieData)
                .enter()
                .append("g")
            g.append("path")
                .style('opactiy', 0)
                .transition()
                .delay(700)
                .attr('stroke', 'none')
                .attr("d", d => arc_generator(d))
                .attr("fill", function(d,i){return pieCol[i]})
        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .transition()
                .duration(1000)
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX + 22.3*4*Math.cos(-40/180 * Math.PI))
                .attr('y2', 22.3*4*Math.sin(-40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //烟草:第2条
        startY = -1;
        if(smoke[index] != 0){
            endX = startX + smoke[index]*3.8*Math.cos(-20/180 * Math.PI);
            endY = smoke[index]*3.8*Math.sin(-20/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [smoke_m[index], smoke_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(smoke[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + ","  + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 19.2*4*Math.cos(-20/180 * Math.PI))
                .attr('y2',19.2*4*Math.sin(-20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //运动:第4条
        startY = 1;
        if(sport[index] != 0){
            endX = startX + sport[index]*3.8*Math.cos(20/180 * Math.PI);
            endY = sport[index]*3.8*Math.sin(20/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [sport_m[index], sport_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(sport[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + "," + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 27.5*4*Math.cos(20/180 * Math.PI))
                .attr('y2',27.5*4*Math.sin(20/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }


        //肥胖:第5条
        startY = 2;
        if(fat[index] != 0){
            endX = startX + fat[index]*3.8*Math.cos(40/180 * Math.PI);
            endY = fat[index]*3.8*Math.sin(40/180 * Math.PI);

            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('y1',startY)
                .attr('x1', startX)
                .attr('x2', endX)
                .attr('y2', endY)
                .style('stroke','rgb(221,110,110)')
                .style('stroke-width','2')

            let dataset = [fat_m[index], fat_f[index]];
                let pie = d3.pie()
                let innerR = 0
                let outR = Math.log(fat[index])*3
                let arc_generator = d3.arc()
                    .innerRadius(innerR)
                    .outerRadius(outR)
                let pieData = pie(dataset)
                
                let g = growingTree.append('g')
                    .attr('transform', 
                    'translate(' + endX + ","  + endY + ')')
                    .attr('class', 'arcs')
                    .selectAll("g")
                    .data(pieData)
                    .enter()
                    .append("g")
                g.append("path")
                    .style('opactiy', 0)
                    .transition()
                    .delay(700)
                    .attr('stroke', 'none')
                    .attr("d", d => arc_generator(d))
                    .attr("fill", function(d,i){return pieCol[i]})

        }else{
            growingTree.append('line')
                .attr('class','triggeredTree')
                .attr('x1', startX)
                .attr('y1', startY)
                .attr('x2', startX)
                .attr('y2', startY)
                .transition()
                .duration(1000)
                .attr('x2',startX + 13.2*3.8*Math.cos(40/180 * Math.PI))
                .attr('y2',13.2*3.8*Math.sin(40/180 * Math.PI))
                .style('stroke-width', 1.5)
                .style('stroke', 'rgb(221,110,110)')
                .attr('stroke-dasharray', '5 5')
        }

    }

    function popback(index){
        let currentRect = d3.select(d3.select('.allDeath').selectAll('polygon')['_groups'][0][index]);

        d3.selectAll('.triggeredTree')
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove()
        d3.selectAll('.arcs')
            .transition()
            .duration(500)
            .style('opacity', 0)
            .remove()


        currentRect.transition()
            .duration(500)
            .style('fill', function(){
                // console.log(deathRate[index])
                if (deathRate[index] > recColorScale[0]) return recCol[2];
                else if(deathRate[index] > recColorScale[1])return recCol[1];
                else return recCol[0]
            })

    }



    function scrollAuto(){
        clearInterval(timer);
        timer = setInterval(function(){
            pop(currentCountryIndex, true);

            if(currentCountryIndex>=193)currentCountryIndex=0;
            else currentCountryIndex += 1;
        },3000)

    }

    function updateTable(index){
        //资料卡更新
        $('.page5 .tableBox .data-countryCh').stop().animate({opacity: 0}, 500, function(){
            $(this).text(countriesZh[index]).animate({opacity: 1},500)
        })
        $('.page5 .tableBox .data-countryEn').stop().animate({opacity: 0}, 500, function(){
            $(this).text(countriesEn[index]).animate({opacity: 1},500)
        })

        //数字刷新
        digitalChange(index);

        //柱状图更新
        updateBar(index);

    }

    function digitalChange(index){
        var Event = {
            number: function(digit){
              var num_arr=[];
              for(var i = 0;i<digit.length;i++){
                num_arr.push(digit.charAt(i));
              }
         
              return num_arr;
            },
            dom: function(arr){
              var str = '';
              for(var i = 0;i<arr.length;i++){
                if(parseInt(arr[i])>=0){
                  str += '<div class="l js-l-box digit-container" data-show='+arr[i]+'>\
                          <span>0</span>\
                          <span>1</span>\
                          <span>2</span>\
                          <span>3</span>\
                          <span>4</span>\
                          <span>5</span>\
                          <span>6</span>\
                          <span>7</span>\
                          <span>8</span>\
                          <span>9</span>\
                        </div>';
                }else{
                   str += '<div class="sign-box l"><span>'+arr[i]+'</span></div>';
                }
              }
              return str;
            },
            animation: function(){
                var height = $(".js-box").height();
                
                $(".js-l-box").each(function(i){
                    var num = parseInt($(this).data("show"));
                    var scrollTop = 0;
                    var scrollTop = height * num;
                    $(this).css("margin-top",0);
                    $(this).animate({marginTop: -scrollTop},1500);
                });
            }
        };

        let final_arr = Event.number(area[index]);
        $(".data-area").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-area").eq(1).html(Event.dom(final_arr));
        Event.animation();
        final_arr = Event.number(population[index]);
        $(".data-population").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-population").eq(1).html(Event.dom(final_arr));
        Event.animation();
        let curRate = (Math.round(deathRate[index]*10000)/100).toString();
        final_arr = Event.number(curRate);
        $(".data-deathRate").eq(0).html(Event.dom(final_arr));
        Event.animation();
        $(".data-deathRate").eq(1).html(Event.dom(final_arr));
        Event.animation();
    }

    function updateBar(index){
        //高血压
        d3.select('.hypertensionBarm')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .style('width',0)
            .transition()
            .delay(200)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', hypertension_m[index] * hypertension[index]*4)
        d3.select('.hypertensionBarf')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .attr('x',170+hypertension_m[index] * hypertension[index]*4)
            .style('width',0)
            .transition()
            .delay(700)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', hypertension_f[index] * hypertension[index]*4)
        d3.select('.hypertensionBartext')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x',172 + hypertension[index]*4)
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', 1)
            .text(hypertension[index]+'%')

        //烟草
        d3.select('.smokeBarm')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .style('width',0)
            .transition()
            .delay(200)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', smoke_m[index] * smoke[index]*4)
        d3.select('.smokeBarf')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .attr('x',170+smoke_m[index] * smoke[index]*4)
            .style('width',0)
            .transition()
            .delay(700)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', smoke_f[index] * smoke[index]*4)
        d3.select('.smokeBartext')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x',172 + smoke[index]*4)
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', 1)
            .text(smoke[index]+'%')

        //糖尿病
        d3.select('.hyperglycemiaBarm')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .style('width',0)
            .transition()
            .delay(200)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', hyperglycemia_m[index] * hyperglycemia[index]*4)
        d3.select('.hyperglycemiaBarf')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .attr('x',170+hyperglycemia_m[index] * hyperglycemia[index]*4)
            .style('width',0)
            .transition()
            .delay(700)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', hyperglycemia_f[index] * hyperglycemia[index]*4)
        d3.select('.hyperglycemiaBartext')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x',172 + hyperglycemia[index]*4)
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', 1)
            .text(hyperglycemia[index]+'%')

        //运动不足
        d3.select('.sportBarm')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .style('width',0)
            .transition()
            .delay(200)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', sport_m[index] * sport[index]*4)
        d3.select('.sportBarf')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .attr('x',170+sport_m[index] * sport[index]*4)
            .style('width',0)
            .transition()
            .delay(700)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', sport_f[index] * sport[index]*4)
        d3.select('.sportBartext')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x',172 + sport[index]*4)
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', 1)
            .text(sport[index]+'%')

        //肥胖
        d3.select('.fatBarm')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .style('width',0)
            .transition()
            .delay(200)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', fat_m[index] * fat[index]*4)
        d3.select('.fatBarf')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .transition()
            .delay(200)
            .duration(1)
            .style('opacity', 1)
            .attr('x',170+fat_m[index] * fat[index]*4)
            .style('width',0)
            .transition()
            .delay(700)
            .duration(500)
            .ease(d3['easeLinear'])
            .style('width', fat_f[index] * fat[index]*4)
        d3.select('.fatBartext')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x',172 + fat[index]*4)
            .transition()
            .delay(700)
            .duration(500)
            .style('opacity', 1)
            .text(fat[index]+'%')

    }

    function updateMap(index){
        $('.mapScale5').css('opacity', 0)
        $('.mapScale10').css('opacity', 0)

        let showWidth, showHeight;

        let fileName = (index+1)/100 >=1 ?
        ''+(index+1) : ((index+1)/10>=1 ?
            '0'+(index+1) : '00'+(index+1));
        if(mapScaleCode[index] == 5){
            fileName+='_5';
            $('.mapScale5').animate({'opacity': 1}, 500)
        }
        else if(mapScaleCode[index] == 10){
            fileName+='_10';
            $('.mapScale10').animate({'opacity': 1}, 500)
        }

        let oImg = $('.countryMap')
        // oImg.stop().animate({'opacity':0},500)
        oImg.css({'opacity':0})

        var img = new Image();
        img.src = "./src/image/maps/" + fileName + '.png';

        if(img.complete){
            // callback(img.width ,img.height);
        }else{
            img.onload = function(){
                showWidth = img.width/3.2;
                showHeight = img.height/3.2
                oImg.css({'width': showWidth, 'height': showHeight, 
                'top': ''+(document.body.clientHeight/2-10- showHeight/2) + 'px',
                'left': ''+(document.body.clientWidth/2 - showWidth/2) + 'px'
                })
                $('.countryMap').attr('src', "./src/image/maps/" + fileName + '.png')
            }
        }
        oImg.delay(500).animate({'opacity':1},500)
    }




    $('.wrapper').fullpage({
        licenseKey: ' i have no key ',
        anchors: ['page1', 'page2', 'page3', 'page4','page5'],
        afterLoad: function(anchor, index){
            if(index.index == 0){

            }
            if(index.index == 1){
                $('.page2 .title').animate({opacity: 1},1000)
                    .next().animate({opacity: 1},1000)
                    .next().delay(1500).animate({opacity: 1},1000)
                    .next().delay(3000).animate({opacity: 1},1000)
                    .next().delay(4500).animate({opacity: 1},1000)
            }
            if(index.index == 2){
                $('.page3 p').eq(0).animate({'top': '-10%'}, 1000)
                $('.page3 p').eq(1)
                    .delay(1000)
                    .animate({'opacity': 1})
                $('.page3 p').eq(0).find('span').eq(3)
                    .delay(1000)
                    .animate({opacity: 1},1000)
                $('.page3 p').eq(2)
                    .delay(2000)
                    .animate({opacity: 1},1000)
                $('.page3 p').eq(3)
                    .delay(2000)
                    .animate({'top': '4%'},2000)
            }
            if(index.index == 3){
                $('.page4 p').eq(0).find('span').eq(1)
                    .animate({opacity: 1},800)
                $('.page4 p').eq(1)
                    .delay(800)
                    .animate({opacity: 1},800)
                $('.page4 p').eq(2)
                    .delay(1600)
                    .animate({opacity: 1},800)
                $('.page4 p').eq(3)
                    .delay(3200)
                    .animate({opacity: 1},800)
                $('.page4 p').eq(4)
                    .delay(4000)
                    .animate({opacity: 1},800)
            }
            if(index.index == 4){
                scrollAuto();
            }
        },
        onLeave: function(index, nextIndex){

        }
    });
});