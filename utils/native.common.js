/**
 * nativeCommon，通过Native.js调用原生API
 */
var nativeCommon = {
    /**
     * 通讯录模块
     */
    contacts:{
        getContact:function(callBack){
            switch (plus.os.name){
                case "iOS":
                    if (plus.device.model === "iPhoneSimulator") {
                        //模拟器
                        nativeCommon.contacts.ios.visitContacts(function(name, phoneNumber){
                            callBack(name, phoneNumber);
                        });
                    } else {
                        //真机
                        nativeCommon.contacts.ios.visitAddressBook(function(name, phoneNumber){
                            callBack(name, phoneNumber);
                        });
                    }
                    break;
                case "Android":
                    nativeCommon.contacts.android.visitContacts(function(name, phoneNumber){
                        callBack(name, phoneNumber);
                    });
                    break;
                default:
                    break;
            }
        },
        ios:{//供iOS系统调用
            /**
             * 访问通讯录，将获取的联系人信息通过callBack返回
             * 仅限模拟器使用（Native.js 的bug）
             * @param {Object} callBack回调
             */
            visitContacts: function(callBack){
                var contactPickerVC = plus.ios.newObject("CNContactPickerViewController");
                //实现代理方法【- (void)contactPicker:(CNContactPickerViewController *)picker didSelectContact:(CNContact *)contact;】
                //同时生成遵守CNContactPickerDelegate协议的代理对象delegate
                var delegate = plus.ios.implements("CNContactPickerDelegate", {
                    "contactPicker:didSelectContact:":function(picker, contact){
                        console.log(JSON.stringify(picker));
                        console.log(JSON.stringify(contact));
                        //姓名
                        var name = "";
                        //姓氏
                        var familyName = contact.plusGetAttribute("familyName");
                        //名字
                        var givenName = contact.plusGetAttribute("givenName");
                        name = familyName+givenName;
                        //电话号码
                        var phoneNo = "";
                        var phoneNumbers = contact.plusGetAttribute("phoneNumbers");
                        if (phoneNumbers.plusGetAttribute("count") > 0) {
                            var phone = phoneNumbers.plusGetAttribute("firstObject");
                            var phoneNumber = phone.plusGetAttribute("value");
                            phoneNo = phoneNumber.plusGetAttribute("stringValue");
                        }
                        if(callBack){
                            callBack(name, phoneNo);
                        }
                    }
                });
                //给通讯录控制器contactPickerVC设置代理
                plus.ios.invoke(contactPickerVC, "setDelegate:", delegate);
				/*
                //获取当前UIWebView视图
                var currentWebview = plus.ios.currentWebview();
                //根据当前UIWebView视图获取当前控制器
                var currentVC = nativeCommon.contacts.ios.getViewControllerByView(currentWebview);
                //由当前控制器present到通讯录控制器
                plus.ios.invoke(currentVC, "presentViewController:animated:completion:", contactPickerVC, true, null);
				*/
				//获取跟控制器
				var rootVc = nativeCommon.contacts.ios.getRootViewController();
				//由跟控制器present到通讯录控制器
				plus.ios.invoke(rootVc, "presentViewController:animated:completion:", contactPickerVC, true, null);
            },
            /**
             * 访问通讯录，将获取的联系人信息通过callBack返回
             * 仅限真机使用（Native.js 的bug）
             * @param {Object} callBack
             */
            visitAddressBook:function(callBack){
                var peoplePickerNavController = plus.ios.newObject("ABPeoplePickerNavigationController");
                //实现代理方法【- (void)peoplePickerNavigationController:(ABPeoplePickerNavigationController *)peoplePicker didSelectPerson:(ABRecordRef)person;】
                //同时生成遵守ABPeoplePickerNavigationControllerDelegate协议的代理对象peoplePickerDelegate
                var peoplePickerDelegate = plus.ios.implements("ABPeoplePickerNavigationControllerDelegate", {
                    "peoplePickerNavigationController:didSelectPerson:":function(peoplePicker, person){
                        //这里的peoplePicker竟然是CNContact实例对象，person是undefined
                        console.log(JSON.stringify(peoplePicker));
                        console.log(JSON.stringify(person));
                        console.log(typeof person);
                        
                        //所以之前的代码不用改
                        var contact = peoplePicker;
                        //姓名
                        var name = "";
                        //姓氏
                        var familyName = contact.plusGetAttribute("familyName");
                        //名字
                        var givenName = contact.plusGetAttribute("givenName");
                        name = familyName+givenName;
                        //电话号码
                        var phoneNo = "";
                        var phoneNumbers = contact.plusGetAttribute("phoneNumbers");
                        if (phoneNumbers.plusGetAttribute("count") > 0) {
                            var phone = phoneNumbers.plusGetAttribute("firstObject");
                            var phoneNumber = phone.plusGetAttribute("value");
                            phoneNo = phoneNumber.plusGetAttribute("stringValue");
                        }
                        if (callBack) {
                            callBack(name, phoneNo);
                        }
                    }
                });
                //给通讯录控制器peoplePickerNavController设置代理
                plus.ios.invoke(peoplePickerNavController, "setPeoplePickerDelegate:", peoplePickerDelegate);
				/*
                //获取当前UIWebView视图
                var currentWebview = plus.ios.currentWebview();
                //根据当前UIWebView视图获取当前控制器
                var currentVC = nativeCommon.contacts.ios.getViewControllerByView(currentWebview);
				//由当前控制器present到通讯录控制器
                plus.ios.invoke(currentVC, "presentViewController:animated:completion:", peoplePickerNavController, true, null);
				*/
				//获取跟控制器
				var rootVc = nativeCommon.contacts.ios.getRootViewController();
				//由跟控制器present到通讯录控制器
				plus.ios.invoke(rootVc, "presentViewController:animated:completion:", peoplePickerNavController, true, null);
            },
			/**
			 * 获取跟控制器
			 */
			getRootViewController: function(){
				//UIApplication类对象
				var UIApplication = plus.ios.invoke("UIApplication", "class");
				var sharedApplication = plus.ios.invoke(UIApplication, "sharedApplication");
				var appDelegate = plus.ios.invoke(sharedApplication, "delegate");
				var appWindow = plus.ios.invoke(appDelegate, "window");
				return plus.ios.invoke(appWindow, "rootViewController");
			},
            /**
             * 根据view获取到当前控制器
             * @param {Object} view
             */
            getViewControllerByView: function(view){
                //UIViewController类对象
                var UIViewController = plus.ios.invoke("UIViewController", "class");
                while(view){
                    var responder = plus.ios.invoke(view, "nextResponder");
                    if (plus.ios.invoke(responder, "isKindOfClass:", UIViewController)) {
                        return responder;
                    }
                    view = plus.ios.invoke(view, "superview");
                }
                return null;
            }
        },
        android:{//供android系统调用
            visitContacts:function(callBack){
                var REQUESTCODE = 1000;
                main = plus.android.runtimeMainActivity();
                var Intent = plus.android.importClass('android.content.Intent');
                var ContactsContract = plus.android.importClass('android.provider.ContactsContract');
                var intent = new Intent(Intent.ACTION_PICK, ContactsContract.Contacts.CONTENT_URI);
                main.onActivityResult = function(requestCode, resultCode, data) { 
                    if (REQUESTCODE == requestCode) {
                        var phoneNumber = "";
                        var resultString = "";
                        var context = main;
                        plus.android.importClass(data);
                        var contactData = data.getData();
                        var resolver = context.getContentResolver();
                        plus.android.importClass(resolver);
                        var cursor = resolver.query(contactData, null, null, null, null);
                        plus.android.importClass(cursor);
                        cursor.moveToFirst();
                        //姓名
                        var givenName = cursor.getString(cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME)) || "";
                        var contactId = cursor.getString(cursor.getColumnIndex(ContactsContract.Contacts._ID));
                        var pCursor = resolver.query(ContactsContract.CommonDataKinds.Phone.CONTENT_URI, null, ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = " + contactId, null, null);
                        if (pCursor.moveToNext()) {
                                phoneNumber =   pCursor.getString( pCursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER));
                        }
                        if (callBack) {
                                callBack(givenName, phoneNumber);
                        }
                        cursor.close();
                        pCursor.close();
                    }
                };
                main.startActivityForResult(intent, REQUESTCODE);
            }
        }
    }
}

export default nativeCommon