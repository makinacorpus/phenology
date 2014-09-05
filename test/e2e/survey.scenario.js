describe('areaSpecies', function() {
  var ptor;
  var sub_header_area_map = by.css("[ui-sref='app.globalmap']");
  var sub_header_area_list= by.css("[ui-sref='app.areas']");
  var sub_header_species_map = by.css("[ui-sref='app.map($state.params)']");
  var sub_header_species_list= by.css("[ui-sref='app.species($state.params)']");
  var map = by.css(".angular-leaflet-map");
  var option_observed = by.css(".option-observed")
  var option_all = by.css(".option-all");

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('use side to load area section', function() {
    element(by.css('.menu-content .left-buttons')).click();
    var menu_item = by.css("[ui-sref='app.areas']");
    expect(ptor.isElementPresent(menu_item)).toBe(true);
    element(menu_item).click();
  });

  it('can switch on area map', function() {

    expect(ptor.isElementPresent(sub_header_area_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_area_list)).toBe(true);

    element(sub_header_area_map).click();
    expect(ptor.isElementPresent(map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_area_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_area_list)).toBe(true);

    element(sub_header_area_list).click();
    expect(ptor.isElementPresent(map)).toBe(false);
    expect(ptor.isElementPresent(sub_header_area_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_area_list)).toBe(true);
  });

  it('can go to species section', function() {
    element.all(by.css(".area-item")).first().click();

    expect(ptor.isElementPresent(sub_header_species_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_species_list)).toBe(true);

    element(option_all).click();
    element(option_observed).click();
  });

  it('can switch on species map', function() {

    element(sub_header_species_map).click();
    expect(ptor.isElementPresent(map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_species_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_species_list)).toBe(true);

    element(sub_header_species_list).click();
    expect(ptor.isElementPresent(map)).toBe(false);
    expect(ptor.isElementPresent(sub_header_species_map)).toBe(true);
    expect(ptor.isElementPresent(sub_header_species_list)).toBe(true);
  });

  it('can go on survey section', function() {
    var individuals = element.all(by.css(".species-item .individual-item"));
    expect(individuals.first().isDisplayed()).toBe(false);
    element.all(by.css(".species-item")).first().click();
    expect(individuals.first().isDisplayed()).toBe(true);
    //individuals.first().click();
    //var pictures = by.css(".pictures");
    //element(by.css(".picture_left")).click();
    //element(by.css(".ion-close")).click();
  });
});
