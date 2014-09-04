describe('homepage', function() {
  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
    browser.getSession().then(function(session){
    	//console.log(session)
    });
  });

  it('should load homepage', function() {
    browser.get('#/dsfsdfsdfsdf');
    var button_synchro = by.css('.synchronize-button-container button');
  	expect(ptor.isElementPresent(button_synchro)).toBe(true);
  });

   it('on synchronize it should load login page', function() {
    element(by.css('.synchronize-button-container button')).click();

    var username = by.model('loginData.username');
    var password = by.model('loginData.password');
    var submit_button = by.css('form button');

  	expect(ptor.isElementPresent(username)).toBe(true);
  	expect(ptor.isElementPresent(password)).toBe(true);
  	expect(ptor.isElementPresent(submit_button)).toBe(true);
  });

  it('with wrong values, submit should fire error', function() {
    element(by.model('loginData.username')).sendKeys('example');
    element(by.model('loginData.password')).sendKeys('example');
    element(by.css('form button')).click();
    var error_element = by.css('.login-error');
  	expect(ptor.isElementPresent(error_element)).toBe(true);
  });

  it('with good values, submit should be good and load data', function() {
    element(by.model('loginData.username')).clear().sendKeys('admin');
    element(by.model('loginData.password')).clear().sendKeys('admin');
    element(by.css('form button')).click();
    var error_element = by.css('.login-error');
  	expect(ptor.isElementPresent(error_element)).toBe(false);
  }); 
});

describe('snowing', function() {
  var ptor;

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  it('use side to load snowing section', function() {
    element(by.css('.menu-content .left-buttons')).click();
    var menu_item = by.css("[ui-sref='app.snowing']");
    expect(ptor.isElementPresent(menu_item)).toBe(true);
    element(menu_item).click();

    //expect(browser.getTitle()).toEqual('Super Calculator');
    //expect(browser.getTitle()).toEqual('Super Calculator');
    //element(by.model('yourName')).sendKeys('Julie');
    //var greeting = element(by.binding('yourName'));
    //expect(greeting.getText()).toEqual('Hello Julie!');
    //expect(web.findElement(by.tagName('legend')).getText()).toMatch("LOGIN_CONNE‌​CT"); 
  });

  it('should fire error if empty', function() {
    var snowing_submit = by.css(".snowing_validate");
    element(snowing_submit).click();

    var popup_title = by.css(".popup-title");
    expect(ptor.isElementPresent(popup_title)).toBe(true);
    expect(element(popup_title).getText()).toMatch('Err');
    element(by.css(".popup button")).click();
  });

  it('should fire error if not a number', function() {
	
	  element(by.model('snowing.height')).sendKeys('test');
    var snowing_submit = by.css(".snowing_validate");
    element(snowing_submit).click();

    var popup_title = by.css(".popup-title");
    expect(ptor.isElementPresent(popup_title)).toBe(true);
    expect(element(popup_title).getText()).toMatch('Err');
    element(by.css(".popup button")).click();
  });

  it('should show a success message if one input is filled by a number', function() {
  
    ptor.refresh();
    element(by.model('snowing.height')).sendKeys('1.2424');
    var snowing_submit = by.css(".snowing_validate");
    element(snowing_submit).click();

    var popup_title = by.css(".popup-title");
    expect(ptor.isElementPresent(popup_title)).toBe(true);
    expect(element(popup_title).getText()).toMatch('Succ');
    element(by.css(".popup button")).click();

  });

    //expect(browser.getTitle()).toEqual('Super Calculator');
    //expect(browser.getTitle()).toEqual('Super Calculator');
    //element(by.model('yourName')).sendKeys('Julie');
    //var greeting = element(by.binding('yourName'));
    //expect(greeting.getText()).toEqual('Hello Julie!');
    //expect(web.findElement(by.tagName('legend')).getText()).toMatch("LOGIN_CONNE‌​CT"); 
});


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
    individuals.first().click();
    var pictures = by.css(".pictures");
  });
});

