class Settings {
    constructor(root) {
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        this.$settings = $(`
<div class="ac-game-settings">
    <div class="ac-game-settings-login">
        <div class="ac-game-settings-title">
            登录
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>登录</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            注册
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://git.acwing.com/RyanMoriarty/homework/-/raw/master/ganyu_happy.jpg">
            <br>
            <div>
                一键登录
            </div>
        </div>
    </div>
    <div class="ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://git.acwing.com/RyanMoriarty/homework/-/raw/master/ganyu_happy.jpg">
            <br>
            <div>
                一键登录
            </div>
        </div>
    </div>
</div>


<p style="background:none;height: 5%;position: fixed;bottom: 0px;width: 100%;text-align: center;
        "><img style="padding-top:2px;" src="https://athinker.club/static/image/menu/a.png"><a class="banquan" style="color:#ffffff;"
                href="https://beian.miit.gov.cn/"
                target="_blank">蜀ICP备2022016210号-1</a>
                <br>
                <span style="color:#ffffff;">yiming | @yiming | All rights reserved.</span>
                </p>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();

        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img');

        this.root.$ac_game.append(this.$settings);

        this.start();
    }
    start() {
        if(this.platform === "ACAPP") {
            this.getinfo_acapp();
        } else {
            if(this.root.access) {
                console.log("存在access");
                history.pushState({},"","https://athinker.club/");
                this.getinfo_web();
                this.refresh_jwt_token();
            } else if(localStorage.getItem("username") !== null) {
                this.get_user();
                console.log("刷新了："+ localStorage.getItem("access"));
                if(new Date().getTime() - this.root.refresh_expires.getTime() >= 12 * 24 * 60 * 60 * 1000 ) {
                    localStorage.clear();
                    this.login();
                    return;
                } else if(new Date().getTime() - this.root.access_expires.getTime() >= 10 * 1000) {
                    $.ajax({
                        url: "https://athinker.club/settings/token/refresh/",
                        type: "post",
                        data: {
                            refresh: this.root.refresh,
                        },
                        success: resp => {
                            this.root.access = resp.access;
                            localStorage.setItem("access", this.root.access);
                            localStorage.setItem("access_expires", new Date());
                            console.log("过期后获得："+localStorage.getItem("access"));
                            this.refresh_jwt_token();

                            this.hide();
                            this.root.menu.show();
                        }
                    });
                }
                this.login_refresh();
            } else {
                this.login();
            }
            this.add_listening_events();
        }
    }

    rem_user() {
        localStorage.setItem("username", this.username);
        localStorage.setItem("photo", this.photo);
        localStorage.setItem("access", this.root.access);
        localStorage.setItem("refresh", this.root.refresh);
        localStorage.setItem("access_expires", new Date());
        localStorage.setItem("refresh_expires", new Date());
    }

    get_user() {
        this.username = localStorage.getItem("username");
        this.photo = localStorage.getItem("photo");
        this.root.access = localStorage.getItem("access");
        this.root.refresh = localStorage.getItem("refresh");
        this.root.access_expires = new Date(localStorage.getItem("access_expires"));
        this.root.refresh_expires = new Date(localStorage.getItem("refresh_expires"));
    }

    refresh_jwt_token() {
        setInterval(() => {
            $.ajax({
                url: "https://athinker.club/settings/token/refresh/",
                type: "post",
                data: {
                    refresh: this.root.refresh,
                },
                success: resp => {
                    this.root.access = resp.access;
                    localStorage.setItem("access", this.root.access);
                    localStorage.setItem("access_expires", new Date());
                }
            });
        }, 5 * 60 * 1000);
        setTimeout(() => {
            $.ajax({
                url: "https://athinker.club/settings/ranklist/",
                type: "get",
                headers: {
                    "Authorization": "Bearer " + this.root.access,
                },
                success: resp => {
                    console.log(resp);
                }
            });
        }, 10 * 1000);
    }

    add_listening_events() {
        this.add_listening_events_login();
        this.add_listening_events_register();

        this.$acwing_login.click(() => {
            this.acwing_login();
        });
    }

    add_listening_events_login() {
        this.$login_register.click(() => {
            this.register();
        });
        this.$login_submit.click(() => {
            this.login_on_remote();
        });
    }

    add_listening_events_register() {
        this.$register_login.click(() => {
            this.login();
        });
        this.$register_submit.click(() => {
            this.register_on_remote();
        });
    }

    acwing_login() {
        $.ajax({
            url: "https://athinker.club/settings/acwing/web/apply_code/",
            type: "GET",
            success: resp => {
                if(resp.result === "success") {
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }



    login_on_remote(username, password) {     // 在远程服务器上登录
        username = username || this.$login_username.val();
        password = password || this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url: "https://athinker.club/settings/token/",
            type: "POST",
            data: {
                username: username,
                password: password,
            },	
            success: resp => {
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();
                this.getinfo_web();
            },
            error: () => {
                this.$login_error_message.html("用户名或密码错误！");
            }
        });
    }

    register_on_remote() {  // 在远程服务器上注册
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url: "https://athinker.club/settings/register/",
            type: "POST",
            data: {
                username,
                password,
                password_confirm,
            },
            success: resp => {
                if(resp.result === "success") {
                    this.login_on_remote(username, password);
                } else {
                    this.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote() {    // 在远程服务器上登出
        if(this.platform === "ACAPP") {
            this.root.AcWingOS.api.window.close();
        } else {
            this.root.access = "";
            this.root.refresh = "";
            localStorage.clear();
            location.href = "/";
        }
    }

    register() {    // 打开注册界面
        this.$login.hide();
        this.$register.show();
    }

    login() {   // 打开登录界面
        this.$register.hide();
        this.$login.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, resp => {
            if(resp.result === "success") {
                this.username = resp.username;
                this.photo = resp.photo;
                this.hide();
                this.root.menu.show();
                this.root.access = resp.access;
                this.root.refresh = resp.refresh;
                this.refresh_jwt_token();
            }
        });
    }

    getinfo_acapp() {
        $.ajax({
            url: "https://athinker.club/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: resp => {
                if(resp.result === "success") {
                    this.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    login_refresh(){
        $.ajax({
            url: "https://athinker.club/settings/getinfo/",
            type: "GET",
            data: {
                platform: this.platform,
            },
            headers: {
                'Authorization': "Bearer " + this.root.access,
            },
            success: resp => {
                if(resp.result === "success") {
                    this.get_user();
                    this.hide();
                    this.root.menu.show();
                } else {
                    this.login();
                }
            }
        });

    }

    getinfo_web() {
        $.ajax({
            url: "https://athinker.club/settings/getinfo/",
            type: "GET",
            data: {
                platform: this.platform,
            },
            headers: {
                'Authorization': "Bearer " + this.root.access,
            },
            success: resp => {
                if(resp.result === "success") {
                    this.username = resp.username;
                    this.photo = resp.photo;
                    this.rem_user();
                    this.hide();
                    this.root.menu.show();
                } else {
                    this.login();
                }
            }
        });
    }

    hide() {
        this.$settings.hide();
    }

    show() {
        this.$settings.show();
    }
}
