const margin = {top: 100, right: 20, bottom: 50, left: 50};
const width = 1160;
const height = 600;
const groups = [
  { key: 'nominees_caucasian', label: 'Caucasian or another', color: '#BFD3C1' },
  { key: 'nominees_afrodescendant', label: 'Afro-descendant', color: '#68A691' },
  { key: 'nominees_hispanic', label: 'Hispanic', color: '#EFC7C2' },
  { key: 'nominees_asian', label: 'Asian', color: '#694F5D' },
];

// Load the data here
d3.csv('./data/academy_awards_nominees.csv').then(data => {
  console.log('orginal data', data);

  const dataFormatted = formatData(data); // From Milestone 3, the data formatting is moved to an external function


  // Declare and populate the awards array - Added during Milestone 3
  const awards = [];
  const dataOriginal = data;

  data.forEach(datum => {
    // If awards doesn't already contain the award, append it
    if (!awards.find(award => award.id === datum.award_id)) {
      const newAward = {
        id: datum.award_id,
        label: datum.award_label
      };
      awards.push(newAward);
    }
  });

  awards.unshift({ id: 'all', label: 'All' });
  console.log('awards', awards);

  createViz(dataOriginal, dataFormatted, awards);
});

// Create your visualization here
const createViz = (dataOriginal, dataFormatted, awards) => {

  // Create scales
  const scaleColor = d3.scaleOrdinal()
    .domain(groups.map(group => group.key))
    .range(groups.map(group => group.color));

  const scaleX = d3.scaleLinear()
    .domain(d3.extent(dataFormatted, d => d.year))
    .range([margin.left, width - margin.right])

  const scaleY = d3.scaleLinear()
    .domain([0, d3.max(dataFormatted, d => d.nominees_total)])
    .range([height - margin.bottom, margin.top]);

  
  // Append svg element
  const svg = d3.select('#viz')
    .append('svg')
      .attr('viewbox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height);

  // Append defs element to SVG
  // Added in milestone 3
  const clipRect = svg
    .append('defs')
    .append('clipPath')
      .attr('id', 'clipPath')
    .append('rect')
      .attr('x', margin.left)
      .attr('y', 0)
      .attr('width', width - margin.right - margin.left)
      .attr('height', height - margin.bottom);

  // Initialize the stack generator
  const stack = d3.stack()
    .keys(groups.map(group => group.key))
    .order(d3.stackOrderAscending) // The smallest areas at the bottom and the largest ones at the top.
    .offset(d3.stackOffsetNone); // Applies a zero baselinevent.

  // Call the stack generator to produce a stack for the data
  let series = stack(dataFormatted);
  console.log('series', series);

  // Initialize the area generator
  const area = d3.area()
    .x(d => scaleX(d.data.year))
    .y0(d => scaleY(d[0]))
    .y1(d => scaleY(d[1]))
    .curve(d3.curveCatmullRom);

  // Append nominees paths
  const nomineesPaths = svg
    .append('g')
      .attr('class', 'stream-paths')
    .selectAll('path')
    .data(series)
    .join('path')
      .attr('d', area)
      .attr('fill', d => scaleColor(d.key))
      .style('clip-path', 'url(#clipPath)'); // Added in milestone 3


  // Append X axis
  axisBottom = d3.axisBottom(scaleX)
    .tickFormat(d3.format(''))
    .tickSizeOuter(0);
  xAxis = svg
    .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .style('font-family', '"Oxygen", sans-serif')
      .style('font-size', '14px')
      .style('opacity', 0.7)
    .call(axisBottom);
  svg
    .append('text')
      .attr('class', 'axis-label axis-label-x')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${(width - margin.left - margin.right) / 2 + margin.left}, ${height})`)
      .text('Year');

  // Append Y axis
  const axisLeft = d3.axisLeft(scaleY)
    .tickSizeOuter(0);
  const yAxis = svg
    .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .style('font-size', '14px')
      .style('opacity', 0.7)
    .call(axisLeft);
  svg
    .append('text')
      .attr('class', 'axis-label axis-label-y')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(12, ${(height - margin.top - margin.bottom) / 2 + margin.top}) rotate(270)`)
      .text('Number of Nominees');


  // Append a color legend
  const legend = d3.select('.legend')
    .append('ul')
    .selectAll('li')
    .data(groups)
    .join('li');
  legend
    .append('span')
      .attr('class', 'legend-color')
      .style('background-color', d => d.color);
  legend
    .append('span')
      .attr('class', 'legend-label')
      .text(d => d.label);



  /*****************************************/
  /*        Milestone 2 starts here        */
  /*****************************************/
  // Add tooltip
  const tooltip = svg
    .append('g')
      .attr('class', 'tooltip-group')
      .attr('transform', `translate(${margin.left},0)`)
      .style('font-size', '14px');
  const tooltipLine = tooltip
    .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', height - margin.bottom + 7)
      .attr('y2', 0)
      .attr('stroke', '#45343D')
      .attr('stroke-dasharray', '6 4');
  const tooltipYear = tooltip
    .append('text')
      .attr('x', 0)
      .attr('y', height - margin.bottom + 35)
      .style('font-size', '17px')
      .style('font-weight', 700)
      .attr('text-anchor', 'middle');

  const tooltipCeremonyTotal = tooltip
    .append('text')
      .attr('class', 'ceremony-breakdown-total')
      .attr('x', 10)
      .attr('y', 10)
      .style('font-weight', 700);
  const tooltipCeremonyBreakdown = tooltip
    .append('text')
      .attr('x', 10)
      .attr('y', 10)
      .style('font-weight', 700);
  tooltipCeremonyBreakdown
    .selectAll('tspan')
    .data(groups)
    .join('tspan')
      .attr('class', d => `ceremony-breakdown-${d.key}`)
      .attr('x', 10)
      .attr('dy', 18);

  // Update tooltip when a mouse moves over the graph
  nomineesPaths.on('mousemove', event => {
    // Set the position of the tooltip according to the x-position of the mouse
    tooltip.attr('transform', `translate(${event.offsetX}, 0)`);

    // Get the year corresponding to the x-position and set the text of the tooltip's year label
      // scaleX is a continuous scale, which means it can return any floating number
      // Since the years are integers, we need to round the value returned by the scale
      const year = Math.round(scaleX.invert(event.offsetX)); 
      tooltipYear.text(year);

    // Get the data related to the current year
    const yearlyData = dataFormatted.find(ceremony => ceremony.year === year);

    // Set the text inside the ceremony breakdown
    d3.select('.ceremony-breakdown-total').text(`${yearlyData.nominees_total} Nominees total`);
    d3.select('.ceremony-breakdown-nominees_caucasian').text(`${yearlyData.nominees_caucasian} ${groups.find(group => group.key === 'nominees_caucasian').label}`);
    d3.select('.ceremony-breakdown-nominees_afrodescendant').text(`${yearlyData.nominees_afrodescendant} ${groups.find(group => group.key === 'nominees_afrodescendant').label}`);
    d3.select('.ceremony-breakdown-nominees_hispanic').text(`${yearlyData.nominees_hispanic} ${groups.find(group => group.key === 'nominees_hispanic').label}`);
    d3.select('.ceremony-breakdown-nominees_asian').text(`${yearlyData.nominees_asian} ${groups.find(group => group.key === 'nominees_asian').label}`);

    // If the tooltip is within the last half of the graph, move the breakdown to the left. Otherwise, keep it on the right.
    if (event.offsetX > width / 2) {
      tooltipCeremonyTotal.attr('transform', `translate(${-175}, 0)`);
      tooltipCeremonyBreakdown.attr('transform', `translate(${-175}, 0)`);
    } else {
      tooltipCeremonyTotal.attr('transform', `translate(0, 0)`);
      tooltipCeremonyBreakdown.attr('transform', `translate(0, 0)`);
    }
  });



  /*****************************************/
  /*        Milestone 3 starts here        */
  /*****************************************/
  // Populate the awards select
  const categorySelect = d3.select('#selectAward');
  categorySelect
    .selectAll('option')
    .data( awards )
    .join('option')
      .attr('value', d =>  d.id )
      .text(d =>  d.label );

  // Add event listener for awards select
  categorySelect.on('change', () => {
    // Get the selected award
    const selectedAward = categorySelect.property( "value" );

    const dataFiltered = selectedAward === 'all' ? dataOriginal : dataOriginal.filter(d => d.award_id === selectedAward);    
   
    // Format the filtered data
    dataFormatted = formatData(dataFiltered);
    
    // Stack the data
    series = stack( dataFormatted );
    console.log('series', series)
    const maxNoms =   +d3.max(dataFormatted, d => d.nominees_total)
    // Update the domain of scaleY
   scaleY.domain([0, maxNoms] );

    // Update the y-axis
    yAxis
      .transition()
      .duration(700)
      .call( axisLeft );
 
    // Update the visualization
    nomineesPaths
      .data( series )
      .transition() // The transition will affect every attribute and/or style that is set after it. In this case the fill and d attributes.
      .duration(700)
        .attr('d',  area ); 
  });



  // Initialize the date slider
  const firstYear = d3.min( dataFormatted, d => d.year );
  const lastYear = d3.max( dataFormatted, d => d.year );
  const yearsRange = d3.range(firstYear, lastYear + 1 ); // Convert to numbers and handle non-inclusive upper bound
  console.log('yearsRange ', yearsRange); 
  const yearsSlider = new rSlider({
    target: '#yearsSlider',
    values:  [yearsRange] , // Set the values array here
    range: true,
    tooltip: true,
    scale: true,
    labels: false,
    set: [ firstYear, lastYear ], // Set the initial values here
    onChange: values => {
      // Handle change here
     /* sliderValues = [ ... , ... ];

      // Update the domain of scaleX
      scaleX.domain( ... );

      // Update the x-axis
      xAxis
        .transition()
        .duration(700)
        .call( axisBottom );

      // Update the stream graph
      nomineesPaths
        .transition()
        .duration(700)
          .attr('d', area ); */
    }
  }); 

};

// Helper function to format data
const formatData = (data) => {
  const dataFormatted = [];
  
  // Find the first and last year in the dataset
  const firstYear = +d3.min(data, d => d.year);
  const lastYear = +d3.max(data, d => d.year);

  // Populate dataFormatted with an object for each year covered by the dataset
  // Intitialize the number of nominees for each group to 0
  for (let i = firstYear; i <=  lastYear; i++) {
    dataFormatted.push({
            year: i,
            nominees_total: 0,
            nominees_caucasian: 0,
            nominees_afrodescendant: 0,
            nominees_hispanic: 0,
            nominees_asian: 0
    });
  }

  // Loop through the original dataset
  data.forEach(d => {
    // In dataFormatted, find the nominees breakdown with a year corresponding to d.year
    const yearBreakdown = dataFormatted.find(item => item.year === +d.year);

    // Increase the value of total nominees by one in the year breakdown
    yearBreakdown.nominees_total += 1;

    // Increase the value of the corresponding ethnic group by one in the year breakdown
    switch (d.ethnic_background) {
      case '':
        yearBreakdown.nominees_caucasian += 1;
        break;
      case 'black':
        yearBreakdown.nominees_afrodescendant += 1;
        break;
      case 'hispanic':
        yearBreakdown.nominees_hispanic += 1;
        break;
      case 'asian':
        yearBreakdown.nominees_asian += 1;
        break;
    }
  });
  console.log('data formatted', dataFormatted);
  
  return dataFormatted;
};