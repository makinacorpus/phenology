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

