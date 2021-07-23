package mediachooser.activity;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Intent;
import android.graphics.*;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.provider.MediaStore;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTabHost;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.Window;
import android.widget.*;
import android.widget.TabHost.OnTabChangeListener;
import com.synconset.FakeR;
import com.synconset.MultiImageChooserActivity;
import mediachooser.FileThumbModel;
import mediachooser.MediaChooser;
import mediachooser.MediaChooserConstants;
import mediachooser.fragment.ImageFragment;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.*;

public class HomeFragmentActivity extends FragmentActivity implements ImageFragment.OnImageSelectedListener{


	private FragmentTabHost mTabHost;
	private TextView headerBarTitle;
	private ImageView headerBarCamera;
	private ImageView headerBarBack;
	private TextView headerBarDone;

	private static Uri fileUri;

	LinearLayout leftLinearContainer;
	private final Handler handler = new Handler();

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE); 
		setContentView(getRLayoutId("activity_home_media_chooser"));

		maxImages = getIntent().getIntExtra(MultiImageChooserActivity.MAX_IMAGES_KEY, MultiImageChooserActivity.NOLIMIT);
		desiredWidth = getIntent().getIntExtra(MultiImageChooserActivity.WIDTH_KEY, 0);
		desiredHeight = getIntent().getIntExtra(MultiImageChooserActivity.HEIGHT_KEY, 0);
		quality = getIntent().getIntExtra(MultiImageChooserActivity.QUALITY_KEY, 0);
		thumbSize = getIntent().getIntExtra(MultiImageChooserActivity.THUMB_SIZE_KEY, 0);
		maxImageCount = maxImages;


		headerBarTitle  = (TextView)findViewById(getRIntId("titleTextViewFromMediaChooserHeaderBar"));
		headerBarCamera = (ImageView)findViewById(getRIntId("cameraImageViewFromMediaChooserHeaderBar"));
		headerBarBack   = (ImageView)findViewById(getRIntId("backArrowImageViewFromMediaChooserHeaderView"));
		headerBarDone   = (TextView)findViewById(getRIntId("doneTextViewViewFromMediaChooserHeaderView"));
		mTabHost        = (FragmentTabHost) findViewById(android.R.id.tabhost);
		leftLinearContainer = (LinearLayout) findViewById(getRIntId("leftLinearContainer"));



		mTabHost.setup(this, getSupportFragmentManager(), getRIntId("realTabcontent"));
		leftLinearContainer.setOnClickListener(clickListener);
		headerBarCamera.setOnClickListener(clickListener);
		headerBarDone.setOnClickListener(clickListener);

		if(! MediaChooserConstants.showCameraVideo){
			headerBarCamera.setVisibility(View.GONE);
		}


		if(getIntent() != null && (getIntent().getBooleanExtra("isFromBucket", false))){

			if(getIntent().getBooleanExtra("image", false)){
				headerBarTitle.setText(getResources().getString(getRStringId("image")));
				setHeaderBarCameraBackground(getResources().getDrawable(getRDrawableId("selector_camera_button")));

				headerBarCamera.setTag(getResources().getString(getRStringId("image")));

				Bundle bundle = new Bundle();
				bundle.putString("name", getIntent().getStringExtra("name"));
				mTabHost.addTab(mTabHost.newTabSpec("tab1").setIndicator(getResources().getString(getRStringId("images_tab")) + "     "), ImageFragment.class, bundle);

			}else{
//				headerBarTitle.setText(getResources().getString(R.string.video));
//				setHeaderBarCameraBackground(getResources().getDrawable(R.drawable.selector_video_button));
//				headerBarCamera.setTag(getResources().getString(R.string.video));
//
//				Bundle bundle = new Bundle();
//				bundle.putString("name", getIntent().getStringExtra("name"));
//				mTabHost.addTab(mTabHost.newTabSpec("tab2").setIndicator(getResources().getString(R.string.videos_tab) + "      "), VideoFragment.class, bundle);
			}
		}else{

//			if(MediaChooserConstants.showVideo){
//				mTabHost.addTab(mTabHost.newTabSpec("tab2").setIndicator(getResources().getString(R.string.videos_tab) + "      "), VideoFragment.class, null);
//			}

			if(MediaChooserConstants.showImage){
				headerBarTitle.setText(getResources().getString(getRStringId("image")));
				setHeaderBarCameraBackground(getResources().getDrawable(getRDrawableId("selector_camera_button")));
				headerBarCamera.setTag(getResources().getString(getRStringId("image")));

				mTabHost.addTab(mTabHost.newTabSpec("tab1").setIndicator(getResources().getString(getRStringId("images_tab")) + "      "), ImageFragment.class, null);
			}

//			if(MediaChooserConstants.showVideo){
//				headerBarTitle.setText(getResources().getString(R.string.video));
//				setHeaderBarCameraBackground(getResources().getDrawable(R.drawable.selector_video_button));
//				headerBarCamera.setTag(getResources().getString(R.string.video));
//			}
		}

		for (int i = 0; i < mTabHost.getTabWidget().getChildCount(); i++) {

			TextView textView = (TextView) mTabHost.getTabWidget().getChildAt(i).findViewById(android.R.id.title);
			if(textView.getLayoutParams() instanceof RelativeLayout.LayoutParams){

				RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) textView.getLayoutParams();
				params.addRule(RelativeLayout.CENTER_HORIZONTAL);
				params.addRule(RelativeLayout.CENTER_VERTICAL);
				params.height = RelativeLayout.LayoutParams.MATCH_PARENT;
				params.width  = RelativeLayout.LayoutParams.WRAP_CONTENT;
				textView.setLayoutParams(params);

			}else if(textView.getLayoutParams() instanceof LinearLayout.LayoutParams){
				LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) textView.getLayoutParams();
				params.gravity = Gravity.CENTER;
				textView.setLayoutParams(params);
			}
			textView.setTextColor(getResources().getColor(getRColorId("tabs_title_color")));
			textView.setTextSize(convertDipToPixels(10));

		}

		if((mTabHost.getTabWidget().getChildAt(0) != null)){
			((TextView)(mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title))).setTextColor(Color.WHITE);
		}

		if((mTabHost.getTabWidget().getChildAt(1) != null)){
			((TextView)(mTabHost.getTabWidget().getChildAt(1).findViewById(android.R.id.title))).setTextColor(getResources().getColor(getRColorId("headerbar_selected_tab_color")));
		}

		mTabHost.setOnTabChangedListener(new OnTabChangeListener() {

			@Override
			public void onTabChanged(String tabId) {

				android.support.v4.app.FragmentManager fragmentManager = getSupportFragmentManager();
				ImageFragment imageFragment  = (ImageFragment) fragmentManager.findFragmentByTag("tab1");
//				VideoFragment videoFragment  = (VideoFragment) fragmentManager.findFragmentByTag("tab2");
				android.support.v4.app.FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();


				if(tabId.equalsIgnoreCase("tab1")){

					headerBarTitle.setText(getResources().getString(getRStringId("image")));
					setHeaderBarCameraBackground(getResources().getDrawable(getRDrawableId("selector_camera_button")));
					headerBarCamera.setTag(getResources().getString(getRStringId("image")));

					if(imageFragment != null){

//						if(videoFragment != null){
//							fragmentTransaction.hide(videoFragment);
//						}
						fragmentTransaction.show(imageFragment);
					}
					((TextView)(mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title))).setTextColor(getResources().getColor(getRColorId("headerbar_selected_tab_color")));
					((TextView)(mTabHost.getTabWidget().getChildAt(1).findViewById(android.R.id.title))).setTextColor(Color.WHITE);

				}else{
//					headerBarTitle.setText(getResources().getString(R.string.video));
//					setHeaderBarCameraBackground(getResources().getDrawable(R.drawable.selector_video_button));
//					headerBarCamera.setTag(getResources().getString(R.string.video));
//
//					if(videoFragment != null){
//
//						if(imageFragment != null){
//							fragmentTransaction.hide(imageFragment);
//						}
//
//						fragmentTransaction.show(videoFragment);
//						if(videoFragment.getAdapter() != null){
//							videoFragment.getAdapter().notifyDataSetChanged();
//						}
//					}
//					((TextView)(mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title))).setTextColor(Color.WHITE);
//					((TextView)(mTabHost.getTabWidget().getChildAt(1).findViewById(android.R.id.title))).setTextColor(getResources().getColor(R.color.headerbar_selected_tab_color));
				}

				fragmentTransaction.commit();
			}
		});

		mTabHost.getTabWidget().getChildAt(0).setVisibility(View.GONE);

//		RelativeLayout.LayoutParams params = (RelativeLayout.LayoutParams) headerBarCamera.getLayoutParams();
//		params.height = convertDipToPixels(40);
//		params.width  = convertDipToPixels(40);
//		headerBarCamera.setLayoutParams(params);
//		headerBarCamera.setScaleType(ScaleType.CENTER_INSIDE);
//		headerBarCamera.setPadding(convertDipToPixels(15), convertDipToPixels(15), convertDipToPixels(15), convertDipToPixels(15));

	}

	OnClickListener clickListener = new OnClickListener() {

		@Override
		public void onClick(View view) {
			if(view == headerBarCamera){

				if(view.getTag().toString().equals(getResources().getString(getRStringId("video")))){
					Intent intent = new Intent(MediaStore.ACTION_VIDEO_CAPTURE);
					fileUri = getOutputMediaFileUri(MediaChooserConstants.MEDIA_TYPE_VIDEO); // create a file to save the image
					intent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri); // set the image file name

					// start the image capture Intent
					startActivityForResult(intent, MediaChooserConstants.CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE);

				}else{
					Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
					fileUri = getOutputMediaFileUri(MediaChooserConstants.MEDIA_TYPE_IMAGE); // create a file to save the image
					intent.putExtra(MediaStore.EXTRA_OUTPUT, fileUri); // set the image file name

					// start the image capture Intent
					startActivityForResult(intent, MediaChooserConstants.CAPTURE_IMAGE_ACTIVITY_REQUEST_CODE);
				}
			}else if(view == headerBarDone){

				android.support.v4.app.FragmentManager fragmentManager = getSupportFragmentManager();
				ImageFragment imageFragment = (ImageFragment) fragmentManager.findFragmentByTag("tab1");
//				VideoFragment videoFragment = (VideoFragment) fragmentManager.findFragmentByTag("tab2");

				if(imageFragment != null){

//					if(videoFragment != null){
//						if(videoFragment.getSelectedVideoList() != null && videoFragment.getSelectedVideoList() .size() > 0){
//							Intent videoIntent = new Intent();
//							videoIntent.setAction(MediaChooser.VIDEO_SELECTED_ACTION_FROM_MEDIA_CHOOSER );
//							videoIntent.putStringArrayListExtra("list", videoFragment.getSelectedVideoList());
//							sendBroadcast(videoIntent);
//						}
//					}

					if(imageFragment != null){
						if(imageFragment.getSelectedImageList() != null && imageFragment.getSelectedImageList().size() > 0){
							Intent imageIntent = new Intent();
							imageIntent.setAction(MediaChooser.IMAGE_SELECTED_ACTION_FROM_MEDIA_CHOOSER);
							imageIntent.putStringArrayListExtra("list", imageFragment.getSelectedImageList());
							sendBroadcast(imageIntent);
						}

						new ResizeImagesTask(imageFragment.getSelectedImageList()).execute(imageFragment.getSelectedMapList().entrySet());

					}

//					finish();
				}else{
					Toast.makeText(HomeFragmentActivity.this, getString(getRStringId("please_select_file")), Toast.LENGTH_SHORT).show();
				}

			}else if(view == leftLinearContainer){
				Intent data = new Intent();
				setResult(RESULT_CANCELED, data);
				finish();
			}
		}
	};

	/** Create a file Uri for saving an image or video */
	private Uri getOutputMediaFileUri(int type){
		return Uri.fromFile(getOutputMediaFile(type));
	}

	/** Create a File for saving an image or video */
	private static File getOutputMediaFile(int type){

		File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), MediaChooserConstants.folderName);
		if (! mediaStorageDir.exists()){
			if (! mediaStorageDir.mkdirs()){
				return null;
			}
		}

		// Create a media file name
		String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
		File mediaFile;
		if (type == MediaChooserConstants.MEDIA_TYPE_IMAGE){
			mediaFile = new File(mediaStorageDir.getPath() + File.separator + "IMG_" + timeStamp + ".jpg");
		} else if(type == MediaChooserConstants.MEDIA_TYPE_VIDEO) {
			mediaFile = new File(mediaStorageDir.getPath() + File.separator + "VID_" + timeStamp + ".mp4");
		} else {
			return null;
		}

		return mediaFile;
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {

		if (requestCode == MediaChooserConstants.CAPTURE_VIDEO_ACTIVITY_REQUEST_CODE) {
			if (resultCode == RESULT_OK ) {

				sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, fileUri));
				final AlertDialog alertDialog = MediaChooserConstants.getDialog(HomeFragmentActivity.this).create();
				alertDialog.show();
				handler.postDelayed(new Runnable() {
					@Override
					public void run() {
						//Do something after 5000ms
						String fileUriString = fileUri.toString().replaceFirst("file:///", "/").trim();
						android.support.v4.app.FragmentManager fragmentManager = getSupportFragmentManager();
					//	VideoFragment videoFragment = (VideoFragment) fragmentManager.findFragmentByTag("tab2");
						//						
//						if(videoFragment == null){
//							VideoFragment newVideoFragment = new VideoFragment();
//							newVideoFragment.addItem(fileUriString);
//
//						}else{
//							videoFragment.addItem(fileUriString);
//						}
						alertDialog.cancel();
					}
				}, 5000);


			} else if (resultCode == RESULT_CANCELED) {
				// User cancelled the video capture
			} else {
				// Video capture failed, advise user
			}
		}else if (requestCode == MediaChooserConstants.CAPTURE_IMAGE_ACTIVITY_REQUEST_CODE) {
			if (resultCode == RESULT_OK ) {

				sendBroadcast(new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, fileUri));

				final AlertDialog alertDialog = MediaChooserConstants.getDialog(HomeFragmentActivity.this).create();
				alertDialog.show();
				handler.postDelayed(new Runnable() {
					@Override
					public void run() {
						//Do something after 5000ms
						String fileUriString = fileUri.toString().replaceFirst("file:///", "/").trim();
						android.support.v4.app.FragmentManager fragmentManager = getSupportFragmentManager();
						ImageFragment imageFragment = (ImageFragment) fragmentManager.findFragmentByTag("tab1");
						if(imageFragment == null){   
							ImageFragment newImageFragment = new ImageFragment();
							newImageFragment.addItem(fileUriString);

						}else{
							imageFragment.addItem(fileUriString);
						}
						alertDialog.cancel();
					}
				}, 5000);
			} 
		}
	}

	@Override
	public void onImageSelected(int count) {
		if( mTabHost.getTabWidget().getChildAt(1) != null){
			if(count != 0){
				((TextView) mTabHost.getTabWidget().getChildAt(1).findViewById(android.R.id.title)).setText(getResources().getString(getRStringId("images_tab")) + "  " + count);

			}else{
				((TextView)mTabHost.getTabWidget().getChildAt(1).findViewById(android.R.id.title)).setText(getResources().getString(getRStringId("image")));
			}
		}else {
			if(count != 0){
				((TextView) mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title)).setText(getResources().getString(getRStringId("images_tab")) + "  "  + count);

			}else{
				((TextView)mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title)).setText(getResources().getString(getRStringId("image")));
			}
		}
	}

//
//	@Override
//	public void onVideoSelected(int count){
//		if(count != 0){
//			((TextView) mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title)).setText(getResources().getString(R.string.videos_tab) + "  "  + count);
//
//		}else{
//			((TextView)mTabHost.getTabWidget().getChildAt(0).findViewById(android.R.id.title)).setText(getResources().getString(R.string.video));
//		}
//	}

	@SuppressLint("NewApi")
	@SuppressWarnings("deprecation")
	private void setHeaderBarCameraBackground(Drawable drawable) {
		int sdk = android.os.Build.VERSION.SDK_INT;
		if(sdk < android.os.Build.VERSION_CODES.JELLY_BEAN) {
			headerBarCamera.setBackgroundDrawable(drawable);
		} else {
			headerBarCamera.setBackground(drawable);
		}
	}

	public int convertDipToPixels(float dips){
		return (int) (dips * HomeFragmentActivity.this.getResources().getDisplayMetrics().density + 0.5f);
	}

	public int getRStringId(String resourceId){
		return FakeR.getId(HomeFragmentActivity.this, "string", resourceId);
	}

	public int getRIntId(String resourceId){
		return FakeR.getId(HomeFragmentActivity.this, "id", resourceId);
	}

	public int getRColorId(String resourceId){
		return FakeR.getId(HomeFragmentActivity.this, "color", resourceId);
	}

	public int getRDrawableId(String resourceId){
		return FakeR.getId(HomeFragmentActivity.this, "drawable", resourceId);
	}
	public int getRLayoutId(String resourceId){
		return FakeR.getId(HomeFragmentActivity.this, "layout", resourceId);
	}


	/*resize task*/
	private int maxImages;
	private int maxImageCount;

	private int desiredWidth;
	private int desiredHeight;
	private int quality;
	private int thumbSize;
	private ProgressDialog progress;

	private class ResizeImagesTask extends AsyncTask<Set<Map.Entry<String, Integer>>, Void, ArrayList<FileThumbModel>>{
		private Exception asyncTaskError = null;
		ArrayList<String> selectedImageList;

		public ResizeImagesTask(ArrayList<String> selectedImageList) {
			  this.selectedImageList = selectedImageList;
		}

		@Override
		protected void onPreExecute() {
			super.onPreExecute();
			progress = new ProgressDialog(HomeFragmentActivity.this);
			progress.setTitle(getResources().getString(getRStringId("processing_images_title")));
			progress.setMessage(getResources().getString(getRStringId("processing_images_message")));
			progress.setCancelable(false);
			progress.show();
		}

		@Override
        protected ArrayList<FileThumbModel> doInBackground(Set<Map.Entry<String, Integer>>... fileSets) {
            Set<Map.Entry<String, Integer>> fileNames = fileSets[0];
            ArrayList<FileThumbModel> files = new ArrayList();

            try {
                Iterator<Map.Entry<String, Integer>> i = fileNames.iterator();
                Bitmap bmp;
                while(i.hasNext()) {
                    Map.Entry<String, Integer> imageInfo = i.next();
                    File originalFile = new File(imageInfo.getKey());
                    int rotate = imageInfo.getValue().intValue();
                    BitmapFactory.Options options = new BitmapFactory.Options();
                    options.inSampleSize = 1;
                    options.inJustDecodeBounds = true;
                    BitmapFactory.decodeFile(originalFile.getAbsolutePath(), options);
                    int width = options.outWidth;
                    int height = options.outHeight;
                    float scale = calculateScale(width, height);
                    if (scale < 1) {
                        int finalWidth = (int)(width * scale);
                        int finalHeight = (int)(height * scale);
                        int inSampleSize = calculateInSampleSize(options, finalWidth, finalHeight);
                        options = new BitmapFactory.Options();
                        options.inSampleSize = inSampleSize;
                        try {
                            bmp = this.tryToGetBitmap(originalFile, options, rotate, true);
                        } catch (OutOfMemoryError e) {
                            options.inSampleSize = calculateNextSampleSize(options.inSampleSize);
                            try {
                                bmp = this.tryToGetBitmap(originalFile, options, rotate, false);
                            } catch (OutOfMemoryError e2) {
                                throw new IOException("Unable to load image into memory.");
                            }
                        }
                    } else {
                        try {
                            bmp = this.tryToGetBitmap(originalFile, null, rotate, false);
                        } catch(OutOfMemoryError e) {
                            options = new BitmapFactory.Options();
                            options.inSampleSize = 2;
                            try {
                                bmp = this.tryToGetBitmap(originalFile, options, rotate, false);
                            } catch(OutOfMemoryError e2) {
                                options = new BitmapFactory.Options();
                                options.inSampleSize = 4;
                                try {
                                    bmp = this.tryToGetBitmap(originalFile, options, rotate, false);
                                } catch (OutOfMemoryError e3) {
                                    throw new IOException("Unable to load image into memory.");
                                }
                            }
                        }
                    }

                    originalFile = this.storeImage(bmp, originalFile.getName());
                    File thumbFile = this.storeImageThumb(bmp, originalFile.getName(), thumbSize);

                    FileThumbModel fileThumbModel = new FileThumbModel();
                    fileThumbModel.original = Uri.fromFile(originalFile).toString();
                    fileThumbModel.thumb = Uri.fromFile(thumbFile).toString();

                    files.add(fileThumbModel);
                }
                return files;
            } catch(IOException e) {
                try {
                    asyncTaskError = e;
                    for (int i = 0; i < files.size(); i++) {
                        FileThumbModel fileThumbModel = files.get(i);
                        URI originalUri = new URI(fileThumbModel.original);
                        URI thumbUri = new URI(fileThumbModel.thumb);
                        File originalFile = new File(originalUri);
                        File thumbFile = new File(thumbUri);
                        originalFile.delete();
                        thumbFile.delete();
                    }
                } catch(Exception exception) {
                    // the finally does what we want to do
                } finally {
                    return new ArrayList<FileThumbModel>();
                }
            }
        }

		@Override
        protected void onPostExecute(ArrayList<FileThumbModel> al) {
            Intent data = new Intent();

            if (asyncTaskError != null) {
                Bundle res = new Bundle();
                res.putString("ERRORMESSAGE", asyncTaskError.getMessage());
                data.putExtras(res);
                setResult(RESULT_CANCELED, data);
            } else if (al.size() > 0) {
                Bundle res = new Bundle();
                res.putParcelableArrayList("MULTIPLEFILENAMES", al);
                data.putStringArrayListExtra("list", selectedImageList);
                res.putInt("TOTALFILES", al.size());
                data.putExtras(res);
                setResult(RESULT_OK, data);
            } else {
                setResult(RESULT_CANCELED, data);
            }

            progress.dismiss();
            finish();
        }

		private Bitmap tryToGetBitmap(File file, BitmapFactory.Options options, int rotate, boolean shouldScale) throws IOException, OutOfMemoryError {
			Bitmap bmp;
			if (options == null) {
				bmp = BitmapFactory.decodeFile(file.getAbsolutePath());
			} else {
				bmp = BitmapFactory.decodeFile(file.getAbsolutePath(), options);
			}
			if (bmp == null) {
				throw new IOException("The image file could not be opened.");
			}
			if (options != null && shouldScale) {
				float scale = calculateScale(options.outWidth, options.outHeight);
				bmp = this.getResizedBitmap(bmp, scale);
			}
			if (rotate != 0) {
				Matrix matrix = new Matrix();
				matrix.setRotate(rotate);
				bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.getWidth(), bmp.getHeight(), matrix, true);
			}
			return bmp;
		}

		/*
        * The following functions are originally from
        * https://github.com/raananw/PhoneGap-Image-Resizer
        *
        * They have been modified by Andrew Stephan for Sync OnSet
        *
        * The software is open source, MIT Licensed.
        * Copyright (C) 2012, webXells GmbH All Rights Reserved.
        */
		private File storeImage(Bitmap bmp, String fileName) throws IOException {
			int index = fileName.lastIndexOf('.');
			String name = fileName.substring(0, index);
			String ext = fileName.substring(index);
			File file = File.createTempFile("tmp_" + name, ext);
			OutputStream outStream = new FileOutputStream(file);
			if (ext.compareToIgnoreCase(".png") == 0) {
				bmp.compress(Bitmap.CompressFormat.PNG, quality, outStream);
			} else {
				bmp.compress(Bitmap.CompressFormat.JPEG, quality, outStream);
			}
			outStream.flush();
			outStream.close();
			return file;
		}

        private File storeImageThumb(Bitmap bm, String fileName, int thumbSize) throws IOException {
            Bitmap bmp = Bitmap.createBitmap((int)thumbSize, (int)thumbSize, Bitmap.Config.ARGB_8888);
            float originalWidth = bm.getWidth(), originalHeight = bm.getHeight();
            Canvas canvas = new Canvas(bmp);

			float widthScale = thumbSize/originalWidth;
            float heightScale = thumbSize/originalHeight;

            // Set scale, xTranslation and yTranslation depending on image being portrait or landscape
            // This will make sure the image is stretched to the thumbnail borders
            float scale, xTranslation, yTranslation;
            if(widthScale > heightScale) {
                scale = widthScale;
                yTranslation = (thumbSize - originalHeight * scale) / 2.0f;
                xTranslation = 0f;
            }
            else {
                scale = heightScale;
                yTranslation = 0f;
                xTranslation = (thumbSize - originalWidth * scale) / 2.0f;
            }
			
            Matrix transformation = new Matrix();
            transformation.postTranslate(xTranslation, yTranslation);
            transformation.preScale(scale, scale);
            Paint paint = new Paint();
            paint.setFilterBitmap(true);
            canvas.drawBitmap(bm, transformation, paint);
			
            int index = fileName.lastIndexOf('.');
            String name = fileName.substring(0, index);
            String ext = fileName.substring(index);
            File file = File.createTempFile("tmp_thumb_" + name, ext);
            OutputStream outStream = new FileOutputStream(file);
            if (ext.compareToIgnoreCase(".png") == 0) {
                bmp.compress(Bitmap.CompressFormat.PNG, quality, outStream);
            } else {
                bmp.compress(Bitmap.CompressFormat.JPEG, quality, outStream);
            }
            outStream.flush();
            outStream.close();
            return file;
        }

		private Bitmap getResizedBitmap(Bitmap bm, float factor) {
			int width = bm.getWidth();
			int height = bm.getHeight();
			// create a matrix for the manipulation
			Matrix matrix = new Matrix();
			// resize the bit map
			matrix.postScale(factor, factor);
			// recreate the new Bitmap
			Bitmap resizedBitmap = Bitmap.createBitmap(bm, 0, 0, width, height, matrix, false);
			return resizedBitmap;
		}
	}

	private int calculateInSampleSize(BitmapFactory.Options options, int reqWidth, int reqHeight) {
		// Raw height and width of image
		final int height = options.outHeight;
		final int width = options.outWidth;
		int inSampleSize = 1;

		if (height > reqHeight || width > reqWidth) {
			final int halfHeight = height / 2;
			final int halfWidth = width / 2;

			// Calculate the largest inSampleSize value that is a power of 2 and keeps both
			// height and width larger than the requested height and width.
			while ((halfHeight / inSampleSize) > reqHeight && (halfWidth / inSampleSize) > reqWidth) {
				inSampleSize *= 2;
			}
		}

		return inSampleSize;
	}

	private int calculateNextSampleSize(int sampleSize) {
		double logBaseTwo = (int)(Math.log(sampleSize) / Math.log(2));
		return (int)Math.pow(logBaseTwo + 1, 2);
	}

	private float calculateScale(int width, int height) {
		float widthScale = 1.0f;
		float heightScale = 1.0f;
		float scale = 1.0f;
		if (desiredWidth > 0 || desiredHeight > 0) {
			if (desiredHeight == 0 && desiredWidth < width) {
				scale = (float)desiredWidth/width;
			} else if (desiredWidth == 0 && desiredHeight < height) {
				scale = (float)desiredHeight/height;
			} else {
				if (desiredWidth > 0 && desiredWidth < width) {
					widthScale = (float)desiredWidth/width;
				}
				if (desiredHeight > 0 && desiredHeight < height) {
					heightScale = (float)desiredHeight/height;
				}
				if (widthScale < heightScale) {
					scale = widthScale;
				} else {
					scale = heightScale;
				}
			}
		}

		return scale;
	}
}


