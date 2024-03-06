/*
Better! EDITOR
by just_qstn
*/

// Импорт модулей
import * as Basic from 'pixel_combats/basic';
import * as API from 'pixel_combats/room';
import * as ColorsLib from './colorslib.js';
import * as JQUtils from './jqutils.js';




// Константы
const ADMIN = "9DE9DFD7D1F5C16A", BANNED = "", COLORS = [ColorsLib.ColorToHex(ColorsLib.Colors.Red), ColorsLib.ColorToHex(ColorsLib.Colors.Blue), ColorsLib.ColorToHex(ColorsLib.Colors.Lime), ColorsLib.ColorToHex(ColorsLib.Colors.Yellow), ColorsLib.ColorToHex(ColorsLib.Colors.Cyan), ColorsLib.ColorToHex(ColorsLib.Colors.Magenta), ColorsLib.ColorToHex(ColorsLib.Colors.Purple), ColorsLib.ColorToHex(ColorsLib.Colors.White)];

// Доступ к функциям и модулям из "терминала"
globalThis.API = API;
globalThis.Ban = Ban;
globalThis.Admin = Admin;
globalThis.JQUtils = JQUtils;
globalThis.ColorsLib = ColorsLib;
globalThis.Basic = Basic;
globalThis.Clear = Clear;

// Переменные
let IsClearing = false;

// Настройки
API.BreackGraph.OnlyPlayerBlocksDmg = false;
API.BreackGraph.WeakBlocks = true;
API.BreackGraph.BreackAll = true;
API.Spawns.GetContext().RespawnTime.Value = 0;
API.Ui.GetContext().QuadsCount.Value = true;
API.Build.GetContext().BlocksSet.Value = API.BuildBlocksSet.AllClear;
API.Build.GetContext().CollapseChangeEnable.Value = true;
API.Build.GetContext().FlyEnable.Value = true;

// Создание команд
let PlayersTeam = JQUtils.CreateTeam("players", { name: "Игроки", undername: "better! editor", isPretty: true }, ColorsLib.Colors.Aquamarine, 1);
let BuildersTeam = JQUtils.CreateTeam("builders", { name: "Строители", undername: "better! editor", isPretty: true }, ColorsLib.Colors.Khaki, 1);
let HintTeam = JQUtils.CreateTeam("better", { name: "Версия: 2.0", undername: "better! editor", isPretty: true }, ColorsLib.Colors.Black, 1);

// Конфигурация
if (API.GameMode.Parameters.GetBool("1hp")) API.contextedProperties.GetContext().MaxHp.Value = 1;
if (API.GameMode.Parameters.GetBool("10000hp")) API.contextedProperties.GetContext(BuildersTeam).MaxHp.Value = 10000;
if (API.GameMode.Parameters.GetBool("godmode_admin")) BuildersTeam.Damage.DamageIn.Value = false;
if (API.GameMode.Parameters.GetBool("godmode_people")) PlayersTeam.DamageIn.Value = false;

// Интерфейс
API.LeaderBoard.PlayerLeaderBoardValues = [
    {
        Value: "rid",
        DisplayName: "<B>r</B>аid",
        ShortDisplayName: "<B>r</B>id"
    },
    {
        Value: "banned",
        DisplayName: "<B>z</B>абанен",
        ShortDisplayName: "<B>z</B>абанен"
    }
];

API.Ui.GetContext().TeamProp1.Value = {
    Team: "better", Prop: "hint"
};
API.Ui.GetContext().TeamProp2.Value = {
    Team: "better", Prop: "hint"
};


// События
function e_join(p) {
    JQUtils.pcall(function () {
        if (p.Team == null) {
            if (p.IdInRoom == 1 || p.Id == ADMIN) API.Properties.GetContext().Get("team" + p.Id).Value = "builders";
            p.Properties.Get("banned").Value = API.Properties.GetContext().Get("banned" + p.Id).Value || false;
            p.Properties.Get("rid").Value = p.IdInRoom;
            let team = API.Properties.GetContext().Get("team" + p.Id).Value || "players";
            API.Teams.Get(team).Add(p);
        }
    }, true);
}

API.Teams.OnRequestJoinTeam.Add(e_join);
API.Players.OnPlayerConnected.Add(function(p)
{
    JQUtils.pcall(function () {
        if (p.Team == null) {
            if (p.IdInRoom == 1 || p.Id == ADMIN) API.Properties.GetContext().Get("team" + p.Id).Value = "builders";
            p.Properties.Get("banned").Value = API.Properties.GetContext().Get("banned" + p.Id).Value || false;
            p.Properties.Get("rid").Value = p.IdInRoom;
            let team = API.Properties.GetContext().Get("team" + p.Id).Value || "players";
            API.Teams.Get(team).Add(p);
        }
    }, true);
});

API.Teams.OnPlayerChangeTeam.Add(function (p) { 
    if (p.Properties.Get("banned").Value) {
        p.Spawns.Despawn();
        p.PopUp("Вы забанены");
    }
    else {
        p.Spawns.Spawn();
        p.Spawns.Spawn();
        p.PopUp("<B><size=55></size><size=20>Добро пожаловать на сервер!</size>\nГайд по режиму ищите в тг канале t.me/pixel_combats2 по тегу #bettereditor</B>");
    }
});

API.Players.OnPlayerDisconnected.Add(function (p) {
    API.Properties.GetContext().Get("banned" + p.Id).Value = p.Properties.Get("banned").Value;
});

API.Teams.OnAddTeam.Add(function (t) {
    let bl = t.Id == "players" ? false : true;
    API.Build.GetContext(t).Pipette.Value = bl;
    API.Build.GetContext(t).FloodFill.Value = bl;
    API.Build.GetContext(t).FillQuad.Value = bl;
    API.Build.GetContext(t).RemoveQuad.Value = bl;
    API.Build.GetContext(t).BalkLenChange.Value = bl;
    API.Build.GetContext(t).SetSkyEnable.Value = bl;
    API.Build.GetContext(t).GenMapEnable.Value = bl;
    API.Build.GetContext(t).ChangeCameraPointsEnable.Value = bl;
    API.Build.GetContext(t).QuadChangeEnable.Value = bl;
    API.Build.GetContext(t).BuildModeEnable.Value = bl;
    API.Build.GetContext(t).RenameMapEnable.Value = bl;
    API.Build.GetContext(t).ChangeMapAuthorsEnable.Value = bl;
    API.Build.GetContext(t).LoadMapEnable.Value = bl;
    API.Build.GetContext(t).ChangeSpawnsEnable.Value = bl;
    API.Build.GetContext(t).BuildRangeEnable.Value = bl;
    API.Inventory.GetContext(t).Main.Value = bl;
    API.Inventory.GetContext(t).MainInfinity.Value = bl;
    API.Inventory.GetContext(t).Secondary.Value = bl;
    API.Inventory.GetContext(t).SecondaryInfinity.Value = bl;
    API.Inventory.GetContext(t).Melee.Value = bl;
    API.Inventory.GetContext(t).BuildInfinity.Value = bl;
    API.Inventory.GetContext(t).Build.Value = bl;
    API.Inventory.GetContext(t).Explosive.Value = bl;
    API.Inventory.GetContext(t).ExplosiveInfinity.Value = bl;
});

HintTeam.Properties.Get("hint").Value = `<B><color=${COLORS[Math.floor(Math.random() * (COLORS.length - 1))]}>Better!</color> EDITOR</B><i>\n\nby just_qstn</i>`;
if (API.GameMode.Parameters.GetBool("gradient")) API.Timers.GetContext().Get("inf").RestartLoop(1);
API.Timers.GetContext().Get("inf").OnTimer.Add(function () {
    let indx = COLORS.indexOf(HintTeam.Properties.Get("hint").Value.slice(10, 17));
    if (indx < COLORS.length - 1) indx++;
    else indx = 0;
    HintTeam.Properties.Get("hint").Value = `<B><color=${COLORS[indx]}>Better!</color> EDITOR</B><i>\n\nby just_qstn</i>`;
});

// Новый механизм команд - теперь нужно просто создать зону с именем, начинающимся на /
// пример имени: /Ban(1);
API.AreaService.OnArea.Add((area) => {
    JQUtils.pcall(() => {
        let str = area.Name.slice(1);
        if (!IsClearing && !area.Tags.Contains("__b") && area.Name[0] == "/") {
            const exec = String(area.Name.slice(1)).split("$").join(".");
            API.Ui.GetContext().Hint.Value = `Выполнен код ${exec}`;
            JQUtils.pcall(new Function(exec), true);
            area.Tags.Add("__b")
        }
    }, true);
});

// Функции

function Ban(id) {
    let p = API.Players.GetByRoomId(parseInt(id));
    if (p.Id == ADMIN) return;
    if (p.Properties.Get("banned").Value) {
        p.Properties.Get("banned").Value = false;
        p.Spawns.Spawn();
    } else {
        p.Properties.Get("banned").Value = true;
        p.PopUp("Вы забанены");
        p.Spawns.Despawn();
    }
}

function Admin(id) {
    let p = API.Players.GetByRoomId(parseInt(id));
    if (p.Id == ADMIN) return;
    if (p.Team == PlayersTeam) {
        BuildersTeam.Add(p);
        API.Properties.GetContext().Get(`team${p.Id}`).Value = "builders";
        p.PopUp("Теперь вы строитель");
    }
    else {
        PlayersTeam.Add(p);
        p.PopUp("Теперь вы игрок");
        API.Properties.GetContext().Get(`team${p.Id}`).Value = "players";
    }
}

function Clear() {
    IsClearing = true;
    API.AreaService.GetByTag("__b").forEach((area) => {
        area.Ranges.Clear();
        area.Tags.Clear();
    });
}
