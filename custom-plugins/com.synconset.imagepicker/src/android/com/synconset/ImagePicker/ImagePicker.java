/**
 * An Image Picker Plugin for Cordova/PhoneGap.
 */
package com.synconset;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONStringer;

import com.google.gson.Gson;
import com.google.gson.JsonArray;

import java.util.ArrayList;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.os.Build;
import android.util.Log;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import mediachooser.FileThumbModel;
import mediachooser.MediaChooser;

public class ImagePicker extends CordovaPlugin {
	public static String TAG = "ImagePicker";
	 
	private JSONObject params;

    private static final String ACTION_GET_PICTURES = "getPictures";
    private static final String ACTION_HAS_READ_PERMISSION = "hasReadPermission";
    private static final String ACTION_REQUEST_READ_PERMISSION = "requestReadPermission";
	
	private static final int PERMISSION_REQUEST_CODE = 100;
	private CallbackContext callbackContext;
	 
	public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
		 this.callbackContext = callbackContext;
		 this.params = args.getJSONObject(0);
		         if (ACTION_HAS_READ_PERMISSION.equals(action)) {
            callbackContext.sendPluginResult(new PluginResult(PluginResult.Status.OK, hasReadPermission()));
            return true;

        } else if (ACTION_REQUEST_READ_PERMISSION.equals(action)) {
            requestReadPermission();
            return true;
		}
         else if (ACTION_GET_PICTURES.equals(action)) {
			Intent intent = new Intent(cordova.getActivity(), mediachooser.activity.BucketHomeFragmentActivity.class);
			int max = 100;
			int desiredWidth = 0;
			int desiredHeight = 0;
			int quality = 100;
			int thumbSize = 100;
			if (this.params.has("maximumImagesCount")) {
				max = this.params.getInt("maximumImagesCount");
			}
			if (this.params.has("width")) {
				desiredWidth = this.params.getInt("width");
			}
			if (this.params.has("height")) {
				desiredWidth = this.params.getInt("height");
			}
			if (this.params.has("quality")) {
				quality = this.params.getInt("quality");
			}
			if(this.params.has("thumbSize")) {
				thumbSize = this.params.getInt("thumbSize");
			}
			intent.putExtra("MAX_IMAGES", max);
			intent.putExtra("WIDTH", desiredWidth);
			intent.putExtra("HEIGHT", desiredHeight);
			intent.putExtra("QUALITY", quality);
			intent.putExtra("THUMB_SIZE", thumbSize);

			// Set the selection limit so users cannot select more than the given amount
			MediaChooser.setSelectionLimit(max);

			// Reset selected image count because of re-initializing the imagepicker
			MediaChooser.setSelectedMediaCount(0);

			// some day, when everybody uses a cordova version supporting 'hasPermission', enable this:
            /*
            if (cordova != null) {
                 if (cordova.hasPermission(Manifest.permission.READ_EXTERNAL_STORAGE)) {
                    cordova.startActivityForResult(this, imagePickerIntent, 0);
                 } else {
                     cordova.requestPermission(
                             this,
                             PERMISSION_REQUEST_CODE,
                             Manifest.permission.READ_EXTERNAL_STORAGE
                     );
                 }
             }
             */
		
			// .. until then use:
            if (hasReadPermission() && this.cordova != null) {
				this.cordova.startActivityForResult((CordovaPlugin) this, intent, 0);
            } else {
                requestReadPermission();
                // The downside is the user needs to re-invoke this picker method.
                // The best thing to do for the dev is check 'hasReadPermission' manually and
                // run 'requestReadPermission' or 'getPictures' based on the outcome.
            }
            return true;
		}
		return true;
	}

	@SuppressLint("InlinedApi")
    private boolean hasReadPermission() {
        return Build.VERSION.SDK_INT < 23 ||
            PackageManager.PERMISSION_GRANTED == ContextCompat.checkSelfPermission(this.cordova.getActivity(), Manifest.permission.READ_EXTERNAL_STORAGE);
    }

    @SuppressLint("InlinedApi")
    private void requestReadPermission() {
        if (!hasReadPermission()) {
            ActivityCompat.requestPermissions(
                this.cordova.getActivity(),
                new String[] {Manifest.permission.READ_EXTERNAL_STORAGE},
                PERMISSION_REQUEST_CODE);
        }
        // This method executes async and we seem to have no known way to receive the result
        // (that's why these methods were later added to Cordova), so simply returning ok now.
        callbackContext.success();
    }
	
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (resultCode == Activity.RESULT_OK && data != null) {
			ArrayList<FileThumbModel> fileThumbModels = new ArrayList();
			Bundle bundle = data.getExtras();
			if(bundle != null){
				fileThumbModels = bundle.getParcelableArrayList("MULTIPLEFILENAMES");
			}

			Gson gson = new Gson();
			String str_json = gson.toJson(fileThumbModels);
			JSONArray res;
			try{
				res = new JSONArray(str_json);
			} catch (JSONException e){
				String error = "error";
				this.callbackContext.error(error);
				return;
			}

			this.callbackContext.success(res);
		} else if (resultCode == Activity.RESULT_CANCELED && data != null) {
			String error = data.getStringExtra("ERRORMESSAGE");
			this.callbackContext.error(error);
		} else if (resultCode == Activity.RESULT_CANCELED) {
			JSONArray res = new JSONArray();
			this.callbackContext.success(res);
		} else {
			this.callbackContext.error("No images selected");
		}
	}
}