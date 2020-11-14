class Action {
    constructor(type, msg) {
        this.type = type
        this.msg = msg
    }

    toRowHtml() {
        return '<tr>'
        +'<th scope="row">'+ this.type +'</th>'
        +'<td>' + this.msg + '</td>'
        +'</tr>'
    }
}


class User {
    constructor(id, location, name, siteAdmin) {
        this.id = id
        this.location = location
        this.name = name
        this.siteAdmin = siteAdmin
        this.followers = []
        this.subscriptions = []
        this.actions = []
    }

    addFollower(user) {
        this.followers.push(user)
    }

    addSubscription(user) {
        this.subscriptions.push(user)
    }

    addAction(a) {
        this.actions.push(a)
    }

    getFollowsers() {
        return this.followers
    }

    getSubscriptions() {
        return this.subscriptions
    }

    getActions() {
        return this.actions
    }

    toListHtml() {
        return '<li class="list-group-item d-flex justify-content-between align-items-center">login : '+this.id+'</id>'
        +'<li class="list-group-item d-flex justify-content-between align-items-center">location : '+this.location+'</id>'
        +'<li class="list-group-item d-flex justify-content-between align-items-center">name : '+this.name+'</id>'
        +'<li class="list-group-item d-flex justify-content-between align-items-center">Admin : '+this.siteAdmin+'</id>'
    }


    toRowHtml() {
        return '<tr>'
                +'<th scope="row">'+ this.id +'</th>'
                +'<td>' + this.location + '</td>'
                +'<td>' + this.name + '</td>'
                +'<td>' + this.siteAdmin + '</td>'
                +'</tr>'
    }
}



let search = async () => {
    let username  = $("#login").val()
    let userData = await fetch('https://api.github.com/users/' + username)
    let userPrincipal = null
    userData.json()
    .then(d => userPrincipal = new User(d.login, d.location, d.name, d.site_admin))
    .catch(err => console.error(err))

    let followersData = await fetch('https://api.github.com/users/'+ username +'/followers')
    let fdata = await followersData.json()
    fdata.forEach(d => {
        userPrincipal.addFollower(new User(d.login, ' - ', ' - ', d.site_admin))
    })

    let subscriptionData = await fetch('https://api.github.com/users/' + username + '/following')
    let sdata = await subscriptionData.json()
    sdata.forEach(d => {
        userPrincipal.addSubscription(new User(d.login, ' - ', ' - ', d.site_admin))
    })
    

    let historyData = await fetch('https://api.github.com/users/' + username + '/events')
    let hdata = await historyData.json()
    hdata.forEach(a => {
        let msg = ''
        if (a.payload?.commits) {
            msg = a.payload?.commits[0].message
        }
        userPrincipal.addAction(new Action(a.type, msg))
    })

    return userPrincipal
}


let refresh = async () => {
    let user = await search()
    $("#user-info-list").html(user.toListHtml())
    let followers = user.getFollowsers().map(u => u.toRowHtml()).join('')
    $("#followers-list").html(followers)
    let following = user.getSubscriptions().map(u => u.toRowHtml()).join('')
    $("#following-list").html(following)
    let actions = user.getActions().map(a => a.toRowHtml()).join('')
    $("#history-list").html(actions)
}

$("#search-form").submit((e) => {
    e.preventDefault()
    refresh()
})