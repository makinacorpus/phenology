describe('snowing', function() {
  var ptor;
  var snowing_submit = by.css(".snowing_validate button");
  var popup_title = by.css(".popup-title");
  var popup_button = by.css(".popup button");

  beforeEach(function() {
    ptor = protractor.getInstance();
  });

  function clearText(elem) {
      length = 100;
      var backspaceSeries = '';
      for (var i = 0; i < length; i++) {
          backspaceSeries += protractor.Key.BACK_SPACE;
      }
      elem.sendKeys(backspaceSeries);
  }

  it('use side to load snowing section', function() {
    element(by.css('.menu-content .left-buttons')).click();
    var menu_item = by.css(".item-menu-snowing");
    expect(ptor.isElementPresent(menu_item)).toBe(true);
    element(menu_item).click();
  });

  it('should fire error if empty', function() {
    expect(ptor.isElementPresent(snowing_submit)).toBe(true);
    element(snowing_submit).click();
    expect(ptor.isElementPresent(popup_title)).toBe(true);
    expect(ptor.isElementPresent(popup_button)).toBeTruthy();;
    browser.wait(function() {
       return element(popup_button).isDisplayed();
    }, 8000);
    expect(element(popup_button).isDisplayed()).toBe(true);
    expect(element(popup_title).getText()).toMatch('Err');
    ptor.sleep(1000)
    element(popup_button).click(); 
  });

  it('should fire error if not a number', function() {
    element.all(by.model('snowing.height')).first().sendKeys('test');
    element(snowing_submit).click();
    browser.wait(function() {
       return element(popup_button).isDisplayed();
    }, 8000);
    var popup_title = by.css(".popup-title");
    expect(ptor.isElementPresent(popup_title)).toBe(true);
    expect(element(popup_title).getText()).toMatch('Err');
    element(by.css(".popup button")).click();
  });

  it('should show a success message if one input is filled by a number', function() {
    clearText(element.all(by.model('snowing.height')).first());
    element.all(by.model('snowing.height')).first().sendKeys('1.2424');
    element(snowing_submit).click();
    browser.wait(function() {
       return element(popup_button).isDisplayed();
    }, 8000);
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