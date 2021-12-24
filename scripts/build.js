const { webpack } = require("webpack");
const path = require("path");
const fs = require("fs");
const downloadElectron = require("electron-download");
const unzip = require("unzipper");
const rimraf = require("rimraf");

const appConfig = require("./webpack.config");
const mainConfig = require("./webpack.main");

const pkg = require("../package.json");
const { spawnSync } = require("child_process");

const buildPath = path.resolve(__dirname, "../build");
const appPath = path.resolve(buildPath, "resources", "app");
const appRendererPath = path.resolve(buildPath, "resources", "app", "app");
const defaultAppAsarPath = path.resolve(buildPath, "resources", "default_app.asar");

mainConfig.devtool = appConfig.devtool = undefined;
mainConfig.mode = appConfig.mode = "production";
appConfig.output.path = appRendererPath;
mainConfig.output.path = appPath;

let platform = process.platform;

if (process.argv.includes("clean"))
{
	rimraf.sync(buildPath);
}


if (process.argv.includes("darwin"))
	platform = "darwin";
else if (process.argv.includes("linux"))
	platform = "linux";
else if (process.argv.includes("win32"))
	platform = "win32";

console.log(`building for ${platform}...`);

const overwriteInfoPlst = (plstPath) =>
{
	const plst = fs.readFileSync(plstPath, "utf-8");
	const lines = plst.split("\n");

	const findLine = (str) =>
	{
		let index = -1;
		lines.find((s, i) => 
		{
			if (s.includes(str))
			{
				index = i;
				return true;
			}
		});
		return index;
	}

	let i = findLine("CFBundleDisplayName");

	if (i != -1)
		lines[i + 1] = lines[i + 1].replace("Electron", "momo");

	i = findLine("CFBundleName")

	if (i != -1)
		lines[i + 1] = lines[i + 1].replace("Electron", "momo");

	fs.writeFileSync(plstPath, lines.join("\n"), "utf-8");

}

const finish = () =>
{
	const pkgData = {
		name: pkg.name,
		version: pkg.version,
		main: "main.bundle.js",
		dependencies: {
			"express": pkg.dependencies["express"]
		}
	};

	fs.writeFileSync(path.resolve(appPath, "package.json"), JSON.stringify(pkgData), "utf-8");

	const assetsDir = path.resolve(__dirname, "../src/assets");
	const distAssetsDir = path.resolve(__dirname, "../build/resources/app/assets");

	if (!fs.existsSync(distAssetsDir))
		fs.mkdirSync(distAssetsDir);

	fs.readdirSync(assetsDir).forEach(f => 
	{
		fs.copyFileSync(path.resolve(assetsDir, f), path.resolve(distAssetsDir, f));
	});

	let electronPath;
	let p;

	switch (platform)
	{
		case "linux":
			electronPath = path.resolve(buildPath, "electron");
			p = path.resolve(buildPath, "momo");
			if (fs.existsSync(electronPath))
				fs.renameSync(electronPath, p);
			break;
		case "win32":
			electronPath = path.resolve(buildPath, "electron.exe");
			p = path.resolve(buildPath, "momo.exe");
			if (fs.existsSync(electronPath))
				fs.renameSync(electronPath, p);
			break;
		case "darwin":
			electronPath = path.resolve(buildPath, "Electron.app");
			p = path.resolve(buildPath, "momo.app");
			if (fs.existsSync(electronPath))
				fs.renameSync(electronPath, p);
			overwriteInfoPlst(path.resolve(p, "Contents", "Info.plist"));
			overwriteInfoPlst(path.resolve(p, "Contents", "Frameworks", "Electron Helper.app", "Contents", "Info.plist"));
			break;
	}

	if (process.platform !== "win32")
	{
		if (fs.existsSync(p))
			spawnSync("chmod", ["+x", p], { stdio: "inherit" });
	}

	spawnSync("npm", ["i"], { cwd: appPath, stdio: "inherit" });
}

const compileApp = () => new Promise((res) => 
{
	webpack(appConfig).run((_, stats) => 
	{
		console.log(`\n[App]:`);
		console.log(stats.toString("minimal"));
		console.log("");
		res();
	});
});

const compileMain = () => new Promise((res) => 
{
	webpack(mainConfig).run((a, stats) => 
	{
		console.log(`\n[Main]:`);
		console.log(stats.toString("minimal"));
		console.log("");
		res();
	});
});

const build = () =>
{
	if (fs.existsSync(appPath))
		rimraf.sync(appPath);

	Promise.all([compileApp(), compileMain()]).then(() => finish());
}

if (fs.existsSync(buildPath))
{
	build();
}
else
{
	downloadElectron({
		version: pkg.devDependencies.electron.replace("^", ""),
		platform: platform,
		arch: process.arch,
		caches: "../electron-caches"
	}, (err, zipPath) =>
	{
		if (err)
			throw err;

		const stream = fs.createReadStream(zipPath);
		stream.on("close", () => 
		{
			if (fs.existsSync(defaultAppAsarPath))
				fs.unlinkSync(defaultAppAsarPath);
			build();
		});
		stream.pipe(unzip.Extract({ path: buildPath }));
	});
}
